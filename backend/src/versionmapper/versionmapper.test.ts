import VersionMapper from './versionmapper'

describe('VersionMapper', () => {

    it('Must Return Exact Version Matches', () => {
        const vm = new VersionMapper()
        vm.AddVersion('1.0.0', '1.0.0')
        vm.AddVersion('1.0.1', '1.0.1')
        vm.AddVersion('1.0.2', '1.0.2')
        vm.AddVersion('1.1.0', '1.1.0')
        vm.AddVersion('1.2.0', '1.2.0')

        expect(vm.GetVersion('1.0.0')).toBe('1.0.0')
        expect(vm.GetVersion('1.0.1')).toBe('1.0.1')
        expect(vm.GetVersion('1.0.2')).toBe('1.0.2')
        expect(vm.GetVersion('1.1.0')).toBe('1.1.0')
        expect(vm.GetVersion('1.2.0')).toBe('1.2.0')
    })

    it('Must return greatest version LESS THAN the supplied version', () => {
        const vm = new VersionMapper()
        vm.AddVersion('1.0.0', '1.0.0')
        vm.AddVersion('1.0.5', '1.0.5')
        vm.AddVersion('1.5.0', '1.5.0')
        expect(vm.GetVersion('1.0.1')).toBe('1.0.0')
        expect(vm.GetVersion('1.0.4')).toBe('1.0.0')
        expect(vm.GetVersion('1.0.6')).toBe('1.0.5')
        expect(vm.GetVersion('1.4.0')).toBe('1.0.5')

        expect(vm.GetVersion('1.5.1')).toBe('1.5.0')
        expect(vm.GetVersion('2.0.0')).toBe('1.5.0')
    })

    it('Must return greatest version LESS THAN the supplied version', () => {
        const vm = new VersionMapper()
        vm.AddVersion('1.0.0', '1.0.0')
        vm.AddVersion('1.5.0', '1.5.0')

        expect(vm.GetVersion(undefined)).toBe('1.5.0')
    })

})
