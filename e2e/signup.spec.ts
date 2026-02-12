import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Test data constants
// ---------------------------------------------------------------------------

const ADULT_BIRTH_DATE = '1990-05-15';
const MINOR_BIRTH_DATE = '2012-03-20';

const API_BASE = '**/api/v1';

const ADULT_BASIC_INFO = {
  firstName: 'Γιώργος',
  lastName: 'Παπαδόπουλος',
  email: 'giorgos@example.com',
  phone: '6901234567',
  birthDate: ADULT_BIRTH_DATE,
  gender: 'male',
  password: 'Secure1234!',
};

const MINOR_BASIC_INFO = {
  ...ADULT_BASIC_INFO,
  firstName: 'Νίκος',
  lastName: 'Αντωνίου',
  email: 'nikos@example.com',
  birthDate: MINOR_BIRTH_DATE,
};

const PARENT_CONSENT_DATA = {
  parentFullName: 'Κώστας Αντωνίου',
  fatherFirstName: 'Κώστας',
  fatherLastName: 'Αντωνίου',
  motherFirstName: 'Μαρία',
  motherLastName: 'Γεωργίου',
  parentBirthDate: '1975-08-10',
  parentIdNumber: 'ΑΒ123456',
  parentPhone: '6909876543',
  parentLocation: 'Αθήνα',
  parentStreet: 'Πανεπιστημίου',
  parentStreetNumber: '42',
  parentPostalCode: '10434',
  parentEmail: 'kostas@example.com',
};

const EMERGENCY_CONTACT = {
  name: 'Ελένη Παπαδοπούλου',
  phone: '6908765432',
};

// ---------------------------------------------------------------------------
// API mock helpers
// ---------------------------------------------------------------------------

/** Mock the age-check endpoint.  Returns `is_minor` based on the provided flag. */
async function mockAgeCheck(page: Page, isMinor: boolean) {
  await page.route(`${API_BASE}/auth/check-age`, async (route) => {
    const body = route.request().postDataJSON();
    const age = isMinor ? 15 : 30;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        is_minor: isMinor,
        age,
        server_date: new Date().toISOString().split('T')[0],
      }),
    });
  });
}

/** Mock the referral validation endpoint (used on HowFoundUsStep). */
async function mockReferralValidation(page: Page, isValid: boolean) {
  await page.route(`${API_BASE}/users/search-by-phone*`, async (route) => {
    if (isValid) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 42, name: 'Δημήτρης Κ.', email: 'dim@example.com', phone: '6911112222' },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null }),
      });
    }
  });
}

/** Mock the final registration endpoint. */
async function mockRegistration(page: Page) {
  await page.route(`${API_BASE}/auth/register-with-consent`, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'User registered',
        user: { id: 1, name: 'Test User', email: 'test@example.com', membership_type: 'basic', status: 'pending' },
        token: 'fake-token-123',
      }),
    });
  });
}

// ---------------------------------------------------------------------------
// UI interaction helpers
// ---------------------------------------------------------------------------

/** Navigate to the signup page and clear any saved form data from localStorage. */
async function goToSignup(page: Page) {
  await page.goto('/signup');
  // Clear any previously saved signup data so tests are independent
  await page.evaluate(() => localStorage.removeItem('sweat24_signup_data'));
  // Reload to apply the clean state
  await page.goto('/signup');
  await page.waitForSelector('#firstName');
}

/** Fill out the BasicInfoStep form fields. */
async function fillBasicInfo(page: Page, info: typeof ADULT_BASIC_INFO) {
  await page.fill('#firstName', info.firstName);
  await page.fill('#lastName', info.lastName);
  await page.fill('#email', info.email);
  await page.fill('#phone', info.phone);
  await page.fill('#birthDate', info.birthDate);

  // Select gender via the custom <Select> component (click trigger then option)
  await page.getByRole('combobox').click();
  const genderLabel = info.gender === 'male' ? 'Άνδρας' : 'Γυναίκα';
  await page.getByRole('option', { name: genderLabel }).click();

  // Wait for the Radix UI Select dropdown to fully close on mobile viewport
  // before interacting with other elements. The Radix Select uses animations
  // that can interfere with subsequent clicks on mobile viewports.
  await page.waitForTimeout(500);

  await page.fill('#password', info.password);
  await page.fill('#confirmPassword', info.password);
}

/** Click the "Συνέχεια" (Continue) button. */
async function clickContinue(page: Page) {
  const btn = page.getByRole('button', { name: 'Συνέχεια' });
  await btn.scrollIntoViewIfNeeded();
  // Use dispatchEvent instead of .click() to avoid Radix UI Select
  // focus-trapping issues on mobile viewports that can swallow Playwright clicks
  await btn.dispatchEvent('click');
}

/** Click the "Πίσω" (Back) button. */
async function clickBack(page: Page) {
  await page.getByRole('button', { name: 'Πίσω' }).click();
}

/** Complete the HowFoundUsStep by selecting "Google" (simplest option). */
async function fillHowFoundUsGoogle(page: Page) {
  await page.getByLabel('Google').click();
}

/** Complete the HowFoundUsStep by selecting "Σύσταση" (referral) with a valid phone. */
async function fillHowFoundUsReferral(page: Page) {
  await page.getByLabel('Σύσταση').click();
  await page.fill('#referralCode', '6911112222');
  // Wait for the debounced validation to finish
  await page.waitForSelector('text=Βρέθηκε', { timeout: 5000 });
}

/** Fill out the ParentConsentStep form. */
async function fillParentConsent(page: Page) {
  await page.fill('#parentFullName', PARENT_CONSENT_DATA.parentFullName);
  await page.fill('#fatherFirstName', PARENT_CONSENT_DATA.fatherFirstName);
  await page.fill('#fatherLastName', PARENT_CONSENT_DATA.fatherLastName);
  await page.fill('#motherFirstName', PARENT_CONSENT_DATA.motherFirstName);
  await page.fill('#motherLastName', PARENT_CONSENT_DATA.motherLastName);
  await page.fill('#parentBirthDate', PARENT_CONSENT_DATA.parentBirthDate);
  await page.fill('#parentIdNumber', PARENT_CONSENT_DATA.parentIdNumber);
  await page.fill('#parentPhone', PARENT_CONSENT_DATA.parentPhone);
  await page.fill('#parentLocation', PARENT_CONSENT_DATA.parentLocation);
  await page.fill('#parentStreet', PARENT_CONSENT_DATA.parentStreet);
  await page.fill('#parentStreetNumber', PARENT_CONSENT_DATA.parentStreetNumber);
  await page.fill('#parentPostalCode', PARENT_CONSENT_DATA.parentPostalCode);
  await page.fill('#parentEmail', PARENT_CONSENT_DATA.parentEmail);

  // Accept the consent checkbox
  await page.getByLabel('Έχω διαβάσει και αποδέχομαι').click();

  // Draw a signature on the canvas (a simple diagonal line)
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 20, box.y + box.height - 20, { steps: 10 });
    await page.mouse.up();
  }
}

/** Use the quick-fill test button on the MedicalHistoryStep then fill emergency contact. */
async function fillMedicalHistory(page: Page) {
  // Click the test data auto-fill button
  await page.getByRole('button', { name: 'Συμπλήρωση Ιατρικών Στοιχείων' }).click();

  // Fill emergency contact (required)
  await page.fill('#emergencyContactName', EMERGENCY_CONTACT.name);
  await page.fill('#emergencyContactPhone', EMERGENCY_CONTACT.phone);
}

// ===========================================================================
// TESTS
// ===========================================================================

test.describe('Signup Flow', () => {
  // -----------------------------------------------------------------------
  // 1. Adult signup - full happy path
  // -----------------------------------------------------------------------
  test.describe('Adult signup flow', () => {
    test('completes all steps without ParentConsentStep', async ({ page }) => {
      // Setup mocks
      await mockAgeCheck(page, false);
      await mockRegistration(page);

      await goToSignup(page);

      // --- Step 1: BasicInfoStep ---
      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);

      // Wait for the age-check API call to complete and step 2 to appear
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      // --- Step 2: HowFoundUsStep ---
      await fillHowFoundUsGoogle(page);
      await clickContinue(page);

      // Step 3 for adults is MedicalHistory (no ParentConsent)
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });

      // --- Step 3: MedicalHistoryStep ---
      await fillMedicalHistory(page);
      await clickContinue(page);

      // --- Step 4: ReviewStep ---
      await expect(page.getByText('Επισκόπηση Στοιχείων')).toBeVisible({ timeout: 5000 });
      // Verify key data is shown in the review
      await expect(page.getByText(ADULT_BASIC_INFO.firstName)).toBeVisible();
      await expect(page.getByText(ADULT_BASIC_INFO.lastName)).toBeVisible();
      await expect(page.getByText(ADULT_BASIC_INFO.email)).toBeVisible();

      // Complete registration
      await page.getByRole('button', { name: 'Ολοκλήρωση Εγγραφής' }).click();

      // Should navigate to success page
      await expect(page).toHaveURL(/signup-success/, { timeout: 10000 });
    });
  });

  // -----------------------------------------------------------------------
  // 2. Minor signup - includes ParentConsentStep
  // -----------------------------------------------------------------------
  test.describe('Minor signup flow', () => {
    test('includes ParentConsentStep between HowFoundUs and MedicalHistory', async ({ page }) => {
      // Setup mocks
      await mockAgeCheck(page, true);
      await mockRegistration(page);

      await goToSignup(page);

      // --- Step 1: BasicInfoStep ---
      await fillBasicInfo(page, MINOR_BASIC_INFO);
      await clickContinue(page);

      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      // --- Step 2: HowFoundUsStep ---
      await fillHowFoundUsGoogle(page);
      await clickContinue(page);

      // Step 3 for minors should be ParentConsentStep
      await expect(page.getByText('Στοιχεία Γονέα/Κηδεμόνα')).toBeVisible({ timeout: 5000 });

      // --- Step 3: ParentConsentStep ---
      await fillParentConsent(page);
      await clickContinue(page);

      // Step 4 for minors is MedicalHistory
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });

      // --- Step 4: MedicalHistoryStep ---
      await fillMedicalHistory(page);
      await clickContinue(page);

      // --- Step 5: ReviewStep ---
      await expect(page.getByText('Επισκόπηση Στοιχείων')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(MINOR_BASIC_INFO.firstName)).toBeVisible();

      // Complete registration
      await page.getByRole('button', { name: 'Ολοκλήρωση Εγγραφής' }).click();
      await expect(page).toHaveURL(/signup-success/, { timeout: 10000 });
    });
  });

  // -----------------------------------------------------------------------
  // 3. Mobile overflow check on ParentConsentStep
  // -----------------------------------------------------------------------
  test.describe('Mobile overflow check', () => {
    test('ParentConsentStep has no horizontal scrollbar at 390px width', async ({ page }) => {
      // Set a narrow mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });

      await mockAgeCheck(page, true);
      await goToSignup(page);

      // Navigate to ParentConsentStep
      await fillBasicInfo(page, MINOR_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Στοιχεία Γονέα/Κηδεμόνα')).toBeVisible({ timeout: 5000 });

      // Check that the page body does not scroll horizontally
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalOverflow).toBe(false);
    });

    test('all form fields are visible and usable at 390px width', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      await mockAgeCheck(page, true);
      await goToSignup(page);

      // Navigate to ParentConsentStep
      await fillBasicInfo(page, MINOR_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });
      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Στοιχεία Γονέα/Κηδεμόνα')).toBeVisible({ timeout: 5000 });

      // Check critical fields are visible (may need scroll into view)
      const fields = [
        '#parentFullName',
        '#fatherFirstName',
        '#fatherLastName',
        '#motherFirstName',
        '#motherLastName',
        '#parentPhone',
        '#parentEmail',
      ];

      for (const selector of fields) {
        const field = page.locator(selector);
        await field.scrollIntoViewIfNeeded();
        await expect(field).toBeVisible();
        // Check that the field is not clipped off the right edge
        const box = await field.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.x + box.width).toBeLessThanOrEqual(390);
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // 4. Form validation
  // -----------------------------------------------------------------------
  test.describe('Form validation', () => {
    test('BasicInfoStep shows error when required fields are empty', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      // Click Continue without filling anything
      await clickContinue(page);

      // A toast error should appear about required fields
      await expect(
        page.getByText('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία')
      ).toBeVisible({ timeout: 3000 });
    });

    test('BasicInfoStep shows error when birth date is missing', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      // Fill everything except birthDate
      await page.fill('#firstName', 'Τεστ');
      await page.fill('#lastName', 'Χρήστης');
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'Secure1234!');
      await page.fill('#confirmPassword', 'Secure1234!');

      await clickContinue(page);

      await expect(
        page.getByText('Παρακαλώ συμπληρώστε την ημερομηνία γέννησης')
      ).toBeVisible({ timeout: 3000 });
    });

    test('BasicInfoStep shows error when passwords do not match', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await page.fill('#firstName', 'Τεστ');
      await page.fill('#lastName', 'Χρήστης');
      await page.fill('#email', 'test@example.com');
      await page.fill('#birthDate', ADULT_BIRTH_DATE);
      await page.fill('#password', 'Secure1234!');
      await page.fill('#confirmPassword', 'Different1234!');

      await clickContinue(page);

      // Use .first() because the message appears both in the toast and as an inline hint
      await expect(
        page.getByText('Οι κωδικοί πρόσβασης δεν ταιριάζουν').first()
      ).toBeVisible({ timeout: 3000 });
    });

    test('BasicInfoStep shows error when password is too short', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await page.fill('#firstName', 'Τεστ');
      await page.fill('#lastName', 'Χρήστης');
      await page.fill('#email', 'test@example.com');
      await page.fill('#birthDate', ADULT_BIRTH_DATE);
      await page.fill('#password', 'Sh0rt');
      await page.fill('#confirmPassword', 'Sh0rt');

      await clickContinue(page);

      await expect(
        page.getByText('Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες')
      ).toBeVisible({ timeout: 3000 });
    });

    test('BasicInfoStep shows inline hint while typing short password', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await page.fill('#password', 'abc');

      // The inline helper text should show the character count
      await expect(page.getByText('3/8')).toBeVisible();
    });

    test('HowFoundUsStep requires a selection before continuing', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      // Try to continue without selecting anything
      await clickContinue(page);

      await expect(
        page.getByText('Παρακαλώ επιλέξτε πώς μας βρήκατε')
      ).toBeVisible({ timeout: 3000 });
    });

    test('HowFoundUsStep referral requires valid phone', async ({ page }) => {
      await mockAgeCheck(page, false);
      await mockReferralValidation(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      // Select referral but leave input empty
      await page.getByLabel('Σύσταση').click();
      await clickContinue(page);

      await expect(
        page.getByText('Παρακαλώ εισάγετε το κινητό τηλέφωνο')
      ).toBeVisible({ timeout: 3000 });
    });

    test('MedicalHistoryStep requires emergency contact', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });

      // Use test autofill for medical data but clear emergency fields
      await page.getByRole('button', { name: 'Συμπλήρωση Ιατρικών Στοιχείων' }).click();

      // Do NOT fill emergency contact
      await clickContinue(page);

      await expect(
        page.getByText('Παρακαλώ συμπληρώστε τα στοιχεία επείγουσας επικοινωνίας')
      ).toBeVisible({ timeout: 3000 });
    });

    test('MedicalHistoryStep requires liability acceptance', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });

      // Fill emergency contact but do NOT accept liability
      await page.fill('#emergencyContactName', EMERGENCY_CONTACT.name);
      await page.fill('#emergencyContactPhone', EMERGENCY_CONTACT.phone);

      // Uncheck liability if it was auto-checked, or just try to continue
      await clickContinue(page);

      await expect(
        page.getByText('Πρέπει να αποδεχθείτε την Υπεύθυνη Δήλωση')
      ).toBeVisible({ timeout: 3000 });
    });
  });

  // -----------------------------------------------------------------------
  // 5. Step navigation
  // -----------------------------------------------------------------------
  test.describe('Step navigation', () => {
    test('can go back from HowFoundUsStep to BasicInfoStep', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await clickBack(page);

      // BasicInfoStep should be visible again with preserved data
      await expect(page.locator('#firstName')).toHaveValue(ADULT_BASIC_INFO.firstName);
      await expect(page.locator('#lastName')).toHaveValue(ADULT_BASIC_INFO.lastName);
      await expect(page.locator('#email')).toHaveValue(ADULT_BASIC_INFO.email);
    });

    test('can go back from MedicalHistoryStep to HowFoundUsStep (adult)', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });

      await clickBack(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });
    });

    test('can go back from ParentConsentStep to HowFoundUsStep (minor)', async ({ page }) => {
      await mockAgeCheck(page, true);
      await goToSignup(page);

      await fillBasicInfo(page, MINOR_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Στοιχεία Γονέα/Κηδεμόνα')).toBeVisible({ timeout: 5000 });

      await clickBack(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });
    });

    test('can go back from ReviewStep to MedicalHistoryStep (adult)', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      await fillHowFoundUsGoogle(page);
      await clickContinue(page);
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });

      await fillMedicalHistory(page);
      await clickContinue(page);
      await expect(page.getByText('Επισκόπηση Στοιχείων')).toBeVisible({ timeout: 5000 });

      await clickBack(page);
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });
    });

    test('stepper header shows correct number of steps for adult (4) vs minor (5)', async ({ page }) => {
      // Adult flow: 4 steps
      await mockAgeCheck(page, false);
      await goToSignup(page);
      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      // Count step indicators (circles in the stepper)
      // Each step has a rounded circle div. We look for step titles.
      const adultStepTitles = ['Βασικά Στοιχεία', 'Πώς μας βρήκατε', 'Ιατρικό Ιστορικό', 'Επισκόπηση'];
      for (const title of adultStepTitles) {
        await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
      }
      // ParentConsent step should NOT be visible
      await expect(page.getByText('Συγκατάθεση Γονέα')).not.toBeVisible();
    });
  });

  // -----------------------------------------------------------------------
  // 6. HowFoundUs social media sub-option
  // -----------------------------------------------------------------------
  test.describe('HowFoundUs social media flow', () => {
    test('selecting Social shows platform selection and requires choice', async ({ page }) => {
      await mockAgeCheck(page, false);
      await goToSignup(page);

      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);
      await expect(page.getByText('Πώς μας βρήκατε;')).toBeVisible({ timeout: 5000 });

      // Select Social
      await page.getByLabel('Social').click();

      // Platform options should appear
      await expect(page.getByLabel('Instagram')).toBeVisible();
      await expect(page.getByLabel('TikTok')).toBeVisible();
      await expect(page.getByLabel('Facebook')).toBeVisible();

      // Try to continue without selecting platform
      await clickContinue(page);
      await expect(
        page.getByText('Παρακαλώ επιλέξτε την πλατφόρμα social media')
      ).toBeVisible({ timeout: 3000 });

      // Select a platform and continue
      await page.getByLabel('Instagram').click();
      await clickContinue(page);

      // Should advance to the next step
      await expect(page.getByText('Υπάρχει κάποια από τις ακόλουθες')).toBeVisible({ timeout: 5000 });
    });
  });

  // -----------------------------------------------------------------------
  // 7. Age check API error handling
  // -----------------------------------------------------------------------
  test.describe('Age check API error', () => {
    test('shows error toast when age verification API fails', async ({ page }) => {
      // Mock a failed age check
      await page.route(`${API_BASE}/auth/check-age`, async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      });

      await goToSignup(page);
      await fillBasicInfo(page, ADULT_BASIC_INFO);
      await clickContinue(page);

      // Should show an error and stay on step 1
      await expect(
        page.getByText('Αποτυχία ελέγχου ηλικίας')
      ).toBeVisible({ timeout: 5000 });

      // Should still be on BasicInfoStep
      await expect(page.locator('#firstName')).toBeVisible();
    });
  });
});
