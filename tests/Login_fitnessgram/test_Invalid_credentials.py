from playwright.sync_api import sync_playwright, expect

def test_Invalid_credentials():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto("http://50.19.46.175/")
        page.get_by_placeholder("e.g. John").click()
        page.get_by_placeholder("e.g. John").fill("shrikantX")
        page.locator("#loginPassword").click(modifiers=["Shift"])
        page.locator("#loginPassword").click()
        page.locator("#loginPassword").fill("Xelpmoc@123")
        page.locator("form svg").click()
        page.locator("span").nth(2).click()
        page.get_by_role("button", name="Log In").click()
        page.locator("[id=\"chakra-modal--body-:r8:\"]").get_by_text("OK").click()
        page.close()

        # ---------------------
        context.close()
        browser.close()
