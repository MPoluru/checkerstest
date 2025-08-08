// playwright.config.js
export const use = {
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'off',
    video: 'off',
    trace: 'off',
};
export const reporter = [['html']];
export const timeout = 60000;
