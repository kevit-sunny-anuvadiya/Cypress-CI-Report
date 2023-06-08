export function isLanguageAvailable(browserLanguage: string): string {
    const supportedLanguages = ['de', 'en', 'fr', 'nl'];
    if (supportedLanguages.includes(browserLanguage.slice(0, 2))) {
        return browserLanguage.slice(0, 2);
    }
    return 'en';
}
