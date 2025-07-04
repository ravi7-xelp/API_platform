import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://50.19.46.175/")
    page.get_by_placeholder("e.g. John").click()
    page.get_by_placeholder("e.g. John").fill("testuser")
    page.locator("#loginPassword").click()
    page.locator("#loginPassword").fill("password")
    page.locator("span").nth(2).click()
    page.get_by_role("button", name="Log In").click()
    page.locator("[id=\"chakra-modal--body-:r8:\"]").get_by_text("OK").click()
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
