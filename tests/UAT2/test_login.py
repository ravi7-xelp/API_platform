from playwright.sync_api import sync_playwright, expect

def test_login():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto("https://uat.fitnessgram.com/")
        page.get_by_placeholder("e.g. John").click()
        page.get_by_placeholder("e.g. John").fill("Shrikant")
        page.locator("#loginPassword").click()
        page.locator("#loginPassword").fill("Xelpmoc@123")
        page.locator("span").nth(2).click()
        page.get_by_role("button", name="Log In").click()
        page.get_by_role("img", name="FitnessGram").click()
        page.close()

        # ---------------------
        context.close()
        browser.close()
