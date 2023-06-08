import { defineConfig } from 'cypress';

import * as fs from 'fs-extra';
import * as path from 'path';

function getConfigurationByFile(file) {
    const pathToConfigFile = path.resolve('cypress/config', `${file}.json`);
    if (!fs.existsSync(pathToConfigFile)) {
        console.log(
            'No custom config file found. remove this command from cypress.config.js if you want to run without config file'
        );
        throw new Error('No config files found. Test execution stopped.');
        // return {};
    }
    return fs.readJson(pathToConfigFile);
}
export default defineConfig({
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
        videoOnFailOnly: true
    },
    e2e: {
        setupNodeEvents(on, config) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('cypress-mochawesome-reporter/plugin')(on);
            on('task', {
                generateOTP: require('cypress-otp')
            });
            const file = config.env.configFile || '';
            return getConfigurationByFile(file);
        },
        baseUrl: 'http://localhost:4200',
        specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx,feature}',
        env: {
            loginEmail: 'kartik+cypress@accounton.io',
            loginPassword: 'Cypress@kamigo123'
        },
        experimentalInteractiveRunEvents: true
    }
});
