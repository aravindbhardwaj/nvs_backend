import {
  FOOTER_MENU_SEEDS,
  HEADER_MENU_SEEDS,
  WEBSITE_ORGANIZATION_TYPE_CODES,
} from '../../prisma/seed/constants';

describe('first-level website menu seeds', () => {
  const expectedHeaders = {
    HEADQUARTER: [
      'Home',
      'About Us',
      'Admission',
      'Academic',
      'Recruitment',
      'Transfer',
      'Finance',
      'Construction',
      'Committees',
      'Contact Us',
    ],
    REGIONAL_OFFICE: [
      'Home',
      'About Us',
      'Admission',
      'Academic',
      'Recruitment',
      'Finance',
      'Transfer',
      'Contact Us',
    ],
    JNV: [
      'Home',
      'About Us',
      'Administration',
      'Admission',
      'Academics',
      'Activities',
      'Exams and Results',
      'Tender',
      'Contact Us',
    ],
    NLI: [
      'Home',
      'About Us',
      'Infrastructure',
      'Training',
      'Faculty',
      'Articles',
      'Publications',
      'Contact Us',
    ],
  } as const;

  it.each(WEBSITE_ORGANIZATION_TYPE_CODES)(
    '%s has the required ordered first-level header labels',
    (organizationTypeCode) => {
      expect(
        HEADER_MENU_SEEDS[organizationTypeCode].map(
          ({ titleEnglish }) => titleEnglish,
        ),
      ).toEqual(expectedHeaders[organizationTypeCode]);
    },
  );

  it('uses one ordered policy footer for every website organization type', () => {
    expect(FOOTER_MENU_SEEDS).toEqual([
      {
        titleEnglish: 'Terms & Conditions',
        contentTypeCode: 'TERMS_CONDITIONS',
      },
      { titleEnglish: 'Privacy Policy', contentTypeCode: 'PRIVACY_POLICY' },
      { titleEnglish: 'Copyright Policy', contentTypeCode: 'COPYRIGHT_POLICY' },
      { titleEnglish: 'Hyperlink Policy', contentTypeCode: 'HYPERLINK_POLICY' },
      { titleEnglish: 'Disclaimer', contentTypeCode: 'DISCLAIMER' },
    ]);
  });

  it('defines exactly 55 first-level website menu records', () => {
    const headerCount = Object.values(HEADER_MENU_SEEDS).reduce(
      (total, menus) => total + menus.length,
      0,
    );
    expect(headerCount).toBe(35);
    expect(
      FOOTER_MENU_SEEDS.length * WEBSITE_ORGANIZATION_TYPE_CODES.length,
    ).toBe(20);
  });
});
