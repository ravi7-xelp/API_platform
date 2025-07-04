from playwright.sync_api import sync_playwright, expect

def test_test():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto("https://uat.fitnessgram.com/")
        page.locator("div").filter(has_text="FitnessGram is one of the").nth(4).click()
        page.get_by_text("Login here").click()
        page.close()

        # ---------------------
        context.close()
        browser.close()
