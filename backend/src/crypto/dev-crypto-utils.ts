import crypto from 'crypto'
import { KeyPair, generateKeyPair } from './crypto-utils'
import * as path from 'path'
import * as fs from 'fs'

const dataDir = path.join(__dirname, '..', '..', '..', '.data')

// moved to the 'data dir' in order for stability
// otherwise the keypair was regenerated every time there was a data load
export const devKeyPair: () => Promise<KeyPair> = () => new Promise(async (resolve, reject) => {
    fs.mkdirSync(dataDir, {recursive: true})
    const direntries = fs.readdirSync(dataDir)
    if (!direntries.includes('privateKey.pem') || !direntries.includes('publicKey.pem')) {
        console.log('GENERATING new keypair into ' + dataDir)
        const pair = generateKeyPair()
        fs.writeFileSync(path.join(dataDir, 'privateKey.pem'), (await pair).privateKey)
        fs.writeFileSync(path.join(dataDir, 'publicKey.pem'), (await pair).publicKey)
    }
    resolve({
        privateKey: fs.readFileSync(path.join(dataDir, 'privateKey.pem')).toString(),
        publicKey: fs.readFileSync(path.join(dataDir, 'publicKey.pem')).toString(),
    })
})



const keyPair = devKeyPair()



const ca = keyPair.then(async pair => {
    const direntries = fs.readdirSync(dataDir)
    if (!direntries.includes('ca.pem')) {
        console.log('extracting cert from privateKey.pem')
        const ca = generateCertificate(pair.privateKey, pair.publicKey)
        fs.writeFileSync(path.join(dataDir, 'ca.pem'), ca)
    }
    return fs.readFileSync(path.join(dataDir, 'ca.pem')).toString()
})
const csrKeyPair: Promise<KeyPair> = new Promise(async (resolve, reject) => {
    fs.mkdirSync(dataDir, {recursive: true})
    const direntries = fs.readdirSync(dataDir)
    if (!direntries.includes('csrPrivateKey.pem') || !direntries.includes('csrPublicKey.pem')) {
        console.log('GENERATING new csr keypair into ' + dataDir)
        const pair = generateKeyPair()
        fs.writeFileSync(path.join(dataDir, 'csrPrivateKey.pem'), (await pair).privateKey)
        fs.writeFileSync(path.join(dataDir, 'csrPublicKey.pem'), (await pair).publicKey)
    }
    resolve({
        privateKey: fs.readFileSync(path.join(dataDir, 'csrPrivateKey.pem')).toString(),
        publicKey: fs.readFileSync(path.join(dataDir, 'csrPublicKey.pem')).toString(),
    })
})
const csr = ca.then(async ca => {
    const direntries = fs.readdirSync(dataDir)
    if (direntries.includes('csr.pem')) {
        return fs.readFileSync(path.join(dataDir, 'csr.pem')).toString()
    }
    
    const forge = require("node-forge")
    const csr = forge.pki.createCertificationRequest()
    csr.publicKey = forge.pki.publicKeyFromPem((await csrKeyPair).publicKey)
    csr.setSubject([
        {
          name: "commonName",
          value: "example.org",
        },
        {
          name: "countryName",
          value: "AU",
        },
        {
          shortName: "ST",
          value: "Melbourne",
        },
        {
          name: "localityName",
          value: "Melbourne",
        },
        {
          name: "organizationName",
          value: "Kncept",
        },
        {
          shortName: "OU",
          value: "Dev",
        },
      ])


      csr.setAttributes([
        {
            name: "extensionRequest",
            extensions: [
              {
                name: "subjectAltName",
                altNames: [
                  {
                    // 2 is DNS type
                    type: 2,
                    value: "localhost",
                  },
                  {
                    type: 2,
                    value: "127.0.0.1",
                  },
                  {
                    type: 2,
                    value: "slog.kncept.com",
                  },
                ],
              },
            ],
          },
      ])

    //   console.log('signing WITH', {privateKey: (await csrKeyPair).privateKey})
      console.log('signing USING', {csr})
      csr.sign(forge.pki.privateKeyFromPem((await csrKeyPair).privateKey))
      const verified = csr.verify()
      const pem = forge.pki.certificationRequestToPem(csr)

      fs.writeFileSync(path.join(dataDir, 'csr.pem'), pem)
      return fs.readFileSync(path.join(dataDir, 'csr.pem')).toString()
      
})
const verifyCsr = csr.then(async csrPem => {
    const forge = require("node-forge")
    const csr = forge.pki.certificationRequestFromPem(csrPem)

    const caCert = forge.pki.certificateFromPem(await ca)
    const caKey = forge.pki.privateKeyFromPem((await keyPair).privateKey)


    if (csr.verify()) {
        console.log("Certification request (CSR) verified.");
      } else {
        throw new Error("Signature not verified.");
      }

      const cert = forge.pki.createCertificate();
    cert.serialNumber = "02";

    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + 1
    );

    // subject from CSR
    cert.setSubject(csr.subject.attributes);
    // issuer from CA
    cert.setIssuer(caCert.subject.attributes);

    cert.setExtensions([
      {
        name: "basicConstraints",
        cA: true,
      },
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: "subjectAltName",
        altNames: [
          {
            type: 6, // URI
            value: "http://example.org/webid#me",
          },
        ],
      },
    ]);

    cert.publicKey = csr.publicKey;

    cert.sign(caKey);
    console.log("Certificate created.");

    const certPem = forge.pki.certificateToPem(cert);

    return certPem
})


function generateCertificate (privateKey: string, publicKey: string) {
    const attrs = [
        {
            name: "commonName",
            value: "rootCA.org",
        },
        {
            name: "countryName",
            value: "AU",
        },
        {
            shortName: "ST",
            value: "Australia",
        },
        {
            name: "localityName",
            value: "Melbourne",
        },
        {
            name: "organizationName",
            value: "Kncept",
        },
        {
            shortName: "OU",
            value: "slog",
        },
        ]

    const forge = require("node-forge")
    const pki = forge.pki;

    const prKey = pki.privateKeyFromPem(privateKey);
    const pubKey = pki.publicKeyFromPem(publicKey);

    // create a new certificate
    const cert = pki.createCertificate();

    // fill the required fields
    cert.publicKey = pubKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
        cert.validity.notBefore.getFullYear() + 1
    );
    // here we set subject and issuer as the same one
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    // the actual certificate signing
    cert.sign(prKey);
    // now convert the Forge certificate to PEM format
    return pki.certificateToPem(cert)
    }
