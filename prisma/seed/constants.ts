import { PageStatus, Role } from '@prisma/client';

type OrganizationSeed = {
  name: string;
  code: string;
  typeCode: string;
  parentCode?: string;
  regionCode?: string;
  stateCode?: string;
};

export const ORGANIZATION_TYPES = [
  { id: 1, code: 'HEADQUARTER', name: 'Headquarters' },
  { id: 2, code: 'NLI', name: 'NLI' },
  { id: 3, code: 'REGIONAL_OFFICE', name: 'Regional Office' },
  { id: 4, code: 'JNV', name: 'JNV' },
  { id: 5, code: 'SUPER_ADMIN', name: 'Super Administrator' },
] as const;

export const REGIONS = [
  ['Bhopal', 'BHOPAL', ['12']],
  ['Chandigarh', 'CHANDIGARH', ['27']],
  ['Hyderabad', 'HYDERABAD', ['34']],
  ['Jaipur', 'JAIPUR', ['20']],
  ['Lucknow', 'LUCKNOW', ['24']],
  ['Patna', 'PATNA', ['04']],
  ['Pune', 'PUNE', ['13']],
  ['Shillong', 'SHILLONG', ['15']],
  ['Bhubaneswar', 'BHUBANESWAR', ['18']],
  ['Mumbai', 'MUMBAI', ['13']],
] as const;

export const ORGANIZATIONS: readonly OrganizationSeed[] = [
  {
    name: 'Navodaya Vidyalaya Samiti Headquarters',
    code: 'NVS-HQ',
    typeCode: 'HEADQUARTER',
  },
  {
    name: 'National Level Institution 1',
    code: 'NLI-01',
    typeCode: 'NLI',
  },
  {
    name: 'National Level Institution 2',
    code: 'NLI-02',
    typeCode: 'NLI',
  },
  {
    name: 'National Level Institution 3',
    code: 'NLI-03',
    typeCode: 'NLI',
  },
  {
    name: 'National Level Institution 4',
    code: 'NLI-04',
    typeCode: 'NLI',
  },
  {
    name: 'National Level Institution 5',
    code: 'NLI-05',
    typeCode: 'NLI',
  },
  {
    name: 'National Level Institution 6',
    code: 'NLI-06',
    typeCode: 'NLI',
  },
  {
    name: 'National Level Institution 7',
    code: 'NLI-07',
    typeCode: 'NLI',
  },
  {
    name: 'Regional Office Bhopal',
    code: 'RO-BHOPAL',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'BHOPAL',
  },
  {
    name: 'Regional Office Chandigarh',
    code: 'RO-CHANDIGARH',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'CHANDIGARH',
  },
  {
    name: 'Regional Office Hyderabad',
    code: 'RO-HYDERABAD',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'HYDERABAD',
  },
  {
    name: 'Regional Office Jaipur',
    code: 'RO-JAIPUR',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'JAIPUR',
  },
  {
    name: 'Regional Office Lucknow',
    code: 'RO-LUCKNOW',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'LUCKNOW',
  },
  {
    name: 'Regional Office Patna',
    code: 'RO-PATNA',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'PATNA',
  },
  {
    name: 'Regional Office Pune',
    code: 'RO-PUNE',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'PUNE',
  },
  {
    name: 'Regional Office Shillong',
    code: 'RO-SHILLONG',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'SHILLONG',
  },
  {
    name: 'Regional Office Bhubaneswar',
    code: 'RO-BHUBANESWAR',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'BHUBANESWAR',
  },
  {
    name: 'Regional Office Mumbai',
    code: 'RO-MUMBAI',
    typeCode: 'REGIONAL_OFFICE',
    parentCode: 'NVS-HQ',
    regionCode: 'MUMBAI',
  },
] as const;

export const PERMISSIONS = [
  ['USER_CREATE', 'USER', 'CREATE', 'Create users.'],
  ['USER_VIEW', 'USER', 'VIEW', 'View users.'],
  ['USER_UPDATE', 'USER', 'UPDATE', 'Update users.'],
  ['USER_DELETE', 'USER', 'DELETE', 'Delete users.'],
  ['USER_RESTORE', 'USER', 'RESTORE', 'Restore users.'],
  ['ORGANIZATION_CREATE', 'ORGANIZATION', 'CREATE', 'Create organizations.'],
  ['ORGANIZATION_VIEW', 'ORGANIZATION', 'VIEW', 'View organizations.'],
  ['ORGANIZATION_UPDATE', 'ORGANIZATION', 'UPDATE', 'Update organizations.'],
  ['ORGANIZATION_DELETE', 'ORGANIZATION', 'DELETE', 'Delete organizations.'],
  ['REGION_CREATE', 'REGION', 'CREATE', 'Create regions.'],
  ['REGION_VIEW', 'REGION', 'VIEW', 'View regions.'],
  ['REGION_UPDATE', 'REGION', 'UPDATE', 'Update regions.'],
  ['REGION_DELETE', 'REGION', 'DELETE', 'Delete regions.'],
  ['STATE_VIEW', 'STATE', 'VIEW', 'View states.'],
  ['DISTRICT_VIEW', 'DISTRICT', 'VIEW', 'View districts.'],
  ['CONTENT_TYPE_CREATE', 'CONTENT_TYPE', 'CREATE', 'Create content types.'],
  ['CONTENT_TYPE_VIEW', 'CONTENT_TYPE', 'VIEW', 'View content types.'],
  ['CONTENT_TYPE_UPDATE', 'CONTENT_TYPE', 'UPDATE', 'Update content types.'],
  ['CONTENT_TYPE_DELETE', 'CONTENT_TYPE', 'DELETE', 'Delete content types.'],
  ['MEDIA_TYPE_CREATE', 'MEDIA_TYPE', 'CREATE', 'Create media types.'],
  ['MEDIA_TYPE_VIEW', 'MEDIA_TYPE', 'VIEW', 'View media types.'],
  ['MEDIA_TYPE_UPDATE', 'MEDIA_TYPE', 'UPDATE', 'Update media types.'],
  ['MEDIA_TYPE_DELETE', 'MEDIA_TYPE', 'DELETE', 'Delete media types.'],
  ['PERMISSION_VIEW', 'PERMISSION', 'VIEW', 'View permissions.'],
  ['ROLE_PERMISSION_VIEW', 'ROLE_PERMISSION', 'VIEW', 'View role permissions.'],
  [
    'ROLE_PERMISSION_UPDATE',
    'ROLE_PERMISSION',
    'UPDATE',
    'Update role permissions.',
  ],
  ['PAGE_CREATE', 'PAGE', 'CREATE', 'Create pages.'],
  ['PAGE_VIEW', 'PAGE', 'VIEW', 'View pages.'],
  ['PAGE_UPDATE', 'PAGE', 'UPDATE', 'Update pages.'],
  ['PAGE_DELETE', 'PAGE', 'DELETE', 'Delete pages.'],
  ['MEDIA_UPLOAD', 'MEDIA', 'UPLOAD', 'Upload media.'],
  ['MEDIA_VIEW', 'MEDIA', 'VIEW', 'View media.'],
  ['MEDIA_DELETE', 'MEDIA', 'DELETE', 'Delete media.'],
  ['BANNER_CREATE', 'BANNER', 'CREATE', 'Create banners.'],
  ['BANNER_VIEW', 'BANNER', 'VIEW', 'View banners.'],
  ['BANNER_UPDATE', 'BANNER', 'UPDATE', 'Update banners.'],
  ['BANNER_DELETE', 'BANNER', 'DELETE', 'Delete banners.'],
  ['GALLERY_CREATE', 'GALLERY', 'CREATE', 'Upload gallery images.'],
  ['GALLERY_VIEW', 'GALLERY', 'VIEW', 'View gallery images.'],
  ['GALLERY_UPDATE', 'GALLERY', 'UPDATE', 'Update gallery images.'],
  ['GALLERY_DELETE', 'GALLERY', 'DELETE', 'Delete gallery images.'],
  ['AUDIT_LOG_VIEW', 'AUDIT_LOG', 'VIEW', 'View audit logs.'],
  [
    'VISITOR_ANALYTICS_VIEW',
    'VISITOR_ANALYTICS',
    'VIEW',
    'View visitor analytics reports.',
  ],
  ['MENU_CREATE', 'MENU', 'CREATE', 'Create menu items.'],
  ['MENU_VIEW', 'MENU', 'VIEW', 'View menu items.'],
  ['MENU_UPDATE', 'MENU', 'UPDATE', 'Update menu items.'],
] as const;

const BUSINESS_PERMISSION_KEYS = [
  'PAGE_VIEW',
  'PAGE_CREATE',
  'PAGE_UPDATE',
  'MEDIA_UPLOAD',
  'MEDIA_VIEW',
  'BANNER_CREATE',
  'BANNER_VIEW',
  'BANNER_UPDATE',
  'BANNER_DELETE',
  'GALLERY_CREATE',
  'GALLERY_VIEW',
  'GALLERY_UPDATE',
  'GALLERY_DELETE',
] as const;

export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  [Role.SUPER_ADMIN]: PERMISSIONS.map(([permissionKey]) => permissionKey),
  [Role.HEADQUARTER]: BUSINESS_PERMISSION_KEYS,
  [Role.NLI]: BUSINESS_PERMISSION_KEYS,
  [Role.REGIONAL]: BUSINESS_PERMISSION_KEYS,
  [Role.JNV]: BUSINESS_PERMISSION_KEYS,
};

export const CONTENT_TYPES = [
  ['ABOUT_US', 'About Us'],
  ['MISSION', 'Mission'],
  ['VISION', 'Vision'],
  ['OBJECTIVES', 'Objectives'],
  ['WELCOME_MESSAGE', 'Welcome Message'],
  ['NOTICE', 'Notice'],
  ['ANNOUNCEMENT', 'Announcement'],
  ['CIRCULAR', 'Circular'],
  ['NEWS', 'News'],
  ['TERMS_CONDITIONS', 'Terms & Conditions'],
  ['PRIVACY_POLICY', 'Privacy Policy'],
  ['COPYRIGHT_POLICY', 'Copyright Policy'],
  ['HYPERLINK_POLICY', 'Hyperlink Policy'],
  ['DISCLAIMER', 'Disclaimer'],
] as const;

export const MEDIA_TYPES = [
  ['NOTICE', 'Notice'],
  ['CIRCULAR', 'Circular'],
  ['TENDER', 'Tender'],
  ['OFFICE_MEMORANDUM', 'Office Memorandum'],
  ['OFFICE_ORDER', 'Office Order'],
  ['NOTIFICATION', 'Notification'],
  ['POLICY', 'Policy'],
  ['GUIDELINE', 'Guideline'],
  ['MANUAL', 'Manual'],
  ['REPORT', 'Report'],
  ['RECRUITMENT', 'Recruitment'],
  ['TRAINING_MATERIAL', 'Training Material'],
  ['FORM', 'Form'],
  ['OTHER', 'Other'],
] as const;

export type HeaderMenuSeed = {
  titleEnglish: string;
  mediaTypeCode?: string;
};

export const WEBSITE_ORGANIZATION_TYPE_CODES = [
  'HEADQUARTER',
  'REGIONAL_OFFICE',
  'NLI',
  'JNV',
] as const;

export const HEADER_MENU_SEEDS = {
  HEADQUARTER: [
    { titleEnglish: 'Home' },
    { titleEnglish: 'About Us' },
    { titleEnglish: 'Admission' },
    { titleEnglish: 'Academic' },
    { titleEnglish: 'Recruitment' },
    { titleEnglish: 'Transfer' },
    { titleEnglish: 'Finance' },
    { titleEnglish: 'Construction' },
    { titleEnglish: 'Committees' },
    { titleEnglish: 'Contact Us' },
  ],
  REGIONAL_OFFICE: [
    { titleEnglish: 'Home' },
    { titleEnglish: 'About Us' },
    { titleEnglish: 'Admission' },
    { titleEnglish: 'Academic' },
    { titleEnglish: 'Recruitment' },
    { titleEnglish: 'Finance' },
    { titleEnglish: 'Transfer' },
    { titleEnglish: 'Contact Us' },
  ],
  JNV: [
    { titleEnglish: 'Home' },
    { titleEnglish: 'About Us' },
    { titleEnglish: 'Administration' },
    { titleEnglish: 'Admission' },
    { titleEnglish: 'Academics' },
    { titleEnglish: 'Activities' },
    { titleEnglish: 'Exams and Results' },
    { titleEnglish: 'Tender', mediaTypeCode: 'TENDER' },
    { titleEnglish: 'Contact Us' },
  ],
  NLI: [
    { titleEnglish: 'Home' },
    { titleEnglish: 'About Us' },
    { titleEnglish: 'Infrastructure' },
    { titleEnglish: 'Training' },
    { titleEnglish: 'Faculty' },
    { titleEnglish: 'Articles' },
    { titleEnglish: 'Publications' },
    { titleEnglish: 'Contact Us' },
  ],
} as const satisfies Record<
  (typeof WEBSITE_ORGANIZATION_TYPE_CODES)[number],
  readonly HeaderMenuSeed[]
>;

export const FOOTER_MENU_SEEDS = [
  { titleEnglish: 'Terms & Conditions', contentTypeCode: 'TERMS_CONDITIONS' },
  { titleEnglish: 'Privacy Policy', contentTypeCode: 'PRIVACY_POLICY' },
  { titleEnglish: 'Copyright Policy', contentTypeCode: 'COPYRIGHT_POLICY' },
  { titleEnglish: 'Hyperlink Policy', contentTypeCode: 'HYPERLINK_POLICY' },
  { titleEnglish: 'Disclaimer', contentTypeCode: 'DISCLAIMER' },
] as const;

export const SAMPLE_USERS = [
  {
    name: 'Super Administrator',
    email: 'super.admin@nvs.gov.in',
    role: Role.SUPER_ADMIN,
    organizationCode: 'NVS-HQ',
  },
  {
    name: 'Headquarters User',
    email: 'headquarters.user@nvs.gov.in',
    role: Role.HEADQUARTER,
    organizationCode: 'NVS-HQ',
  },
  {
    name: 'NLI User',
    email: 'nli.user@nvs.gov.in',
    role: Role.NLI,
    organizationCode: 'NLI-01',
  },
  {
    name: 'Regional User',
    email: 'regional.user@nvs.gov.in',
    role: Role.REGIONAL,
    organizationCode: 'RO-BHOPAL',
  },
  {
    name: 'JNV User',
    email: 'jnv.user@nvs.gov.in',
    role: Role.JNV,
    organizationCode: 'JNV-BHOPAL',
  },
] as const;

export const SAMPLE_PAGES = [
  {
    organizationCode: 'NVS-HQ',
    contentType: 'ABOUT_US',
    title: 'About Navodaya Vidyalaya Samiti',
    slug: 'about-navodaya-vidyalaya-samiti',
    content:
      'Navodaya Vidyalaya Samiti provides quality education to talented rural children.',
  },
  {
    organizationCode: 'NVS-HQ',
    contentType: 'MISSION',
    title: 'Our Mission',
    slug: 'navodaya-vidyalaya-samiti-mission',
    content:
      'To provide good quality modern education to talented children from rural areas.',
  },
  {
    organizationCode: 'RO-BHOPAL',
    contentType: 'WELCOME_MESSAGE',
    title: 'Welcome to Regional Office Bhopal',
    slug: 'welcome-regional-office-bhopal',
    content: 'Welcome to the Regional Office Bhopal information portal.',
  },
  {
    organizationCode: 'JNV-BHOPAL',
    contentType: 'ABOUT_US',
    title: 'About School',
    slug: 'about-jnv-bhopal',
    content:
      'Jawahar Navodaya Vidyalaya Bhopal is committed to academic excellence.',
  },
] as const;

export const DEFAULT_SEED_PASSWORD = 'NvsSeed@2026';
export const SAMPLE_PAGE_STATUS = PageStatus.PUBLISHED;
