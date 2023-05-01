# Bootstrap

This is my 'breadcrumb' trail of dev notes. It makes it easier to rip and replace parts of projects.
That... And I seem to keep on doing setup time and again.

# Dev Environment
Set up dev container.
The Current Version of node supported by aws lambdas is 18, so use that.
Because a dev container is used, no attempt will be made to avoid javascripts horrible assumption that all utilities must be globally installed.

# Frontend Setup
npx create-react-app frontend --template typescript

# Backend Setup
mkdir backend && cd backend && npx cdk init app --language=typescript
