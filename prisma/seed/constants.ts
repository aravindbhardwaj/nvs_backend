import { OrganizationType, PageStatus, Role } from '@prisma/client';

type OrganizationSeed = {
  name: string;
  code: string;
  type: OrganizationType;
  parentCode?: string;
  regionCode?: string;
  stateCode?: string;
};

export const REGIONS = [
  ['Bhopal', 'BHOPAL'],
  ['Chandigarh', 'CHANDIGARH'],
  ['Hyderabad', 'HYDERABAD'],
  ['Jaipur', 'JAIPUR'],
  ['Lucknow', 'LUCKNOW'],
  ['Patna', 'PATNA'],
  ['Pune', 'PUNE'],
  ['Shillong', 'SHILLONG'],
  ['Bhubaneswar', 'BHUBANESWAR'],
  ['Mumbai', 'MUMBAI'],
] as const;

export const STATES = [
  ['Andhra Pradesh', 'AP'],
  ['Arunachal Pradesh', 'AR'],
  ['Assam', 'AS'],
  ['Bihar', 'BR'],
  ['Chhattisgarh', 'CG'],
  ['Goa', 'GA'],
  ['Gujarat', 'GJ'],
  ['Haryana', 'HR'],
  ['Himachal Pradesh', 'HP'],
  ['Jharkhand', 'JH'],
  ['Karnataka', 'KA'],
  ['Kerala', 'KL'],
  ['Madhya Pradesh', 'MP'],
  ['Maharashtra', 'MH'],
  ['Manipur', 'MN'],
  ['Meghalaya', 'ML'],
  ['Mizoram', 'MZ'],
  ['Nagaland', 'NL'],
  ['Odisha', 'OD'],
  ['Punjab', 'PB'],
  ['Rajasthan', 'RJ'],
  ['Sikkim', 'SK'],
  ['Tamil Nadu', 'TN'],
  ['Telangana', 'TS'],
  ['Tripura', 'TR'],
  ['Uttar Pradesh', 'UP'],
  ['Uttarakhand', 'UK'],
  ['West Bengal', 'WB'],
  ['Andaman and Nicobar Islands', 'AN'],
  ['Chandigarh', 'CH'],
  ['Dadra and Nagar Haveli and Daman and Diu', 'DH'],
  ['Delhi', 'DL'],
  ['Jammu and Kashmir', 'JK'],
  ['Ladakh', 'LA'],
  ['Lakshadweep', 'LD'],
  ['Puducherry', 'PY'],
] as const;

export const ORGANIZATIONS: readonly OrganizationSeed[] = [
  {
    name: 'Navodaya Vidyalaya Samiti Headquarters',
    code: 'NVS-HQ',
    type: OrganizationType.HEADQUARTER,
  },
  {
    name: 'National Level Institution 1',
    code: 'NLI-01',
    type: OrganizationType.NLI,
  },
  {
    name: 'National Level Institution 2',
    code: 'NLI-02',
    type: OrganizationType.NLI,
  },
  {
    name: 'National Level Institution 3',
    code: 'NLI-03',
    type: OrganizationType.NLI,
  },
  {
    name: 'National Level Institution 4',
    code: 'NLI-04',
    type: OrganizationType.NLI,
  },
  {
    name: 'National Level Institution 5',
    code: 'NLI-05',
    type: OrganizationType.NLI,
  },
  {
    name: 'National Level Institution 6',
    code: 'NLI-06',
    type: OrganizationType.NLI,
  },
  {
    name: 'National Level Institution 7',
    code: 'NLI-07',
    type: OrganizationType.NLI,
  },
  {
    name: 'Regional Office Bhopal',
    code: 'RO-BHOPAL',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'BHOPAL',
  },
  {
    name: 'Regional Office Chandigarh',
    code: 'RO-CHANDIGARH',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'CHANDIGARH',
  },
  {
    name: 'Regional Office Hyderabad',
    code: 'RO-HYDERABAD',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'HYDERABAD',
  },
  {
    name: 'Regional Office Jaipur',
    code: 'RO-JAIPUR',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'JAIPUR',
  },
  {
    name: 'Regional Office Lucknow',
    code: 'RO-LUCKNOW',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'LUCKNOW',
  },
  {
    name: 'Regional Office Patna',
    code: 'RO-PATNA',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'PATNA',
  },
  {
    name: 'Regional Office Pune',
    code: 'RO-PUNE',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'PUNE',
  },
  {
    name: 'Regional Office Shillong',
    code: 'RO-SHILLONG',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'SHILLONG',
  },
  {
    name: 'Regional Office Bhubaneswar',
    code: 'RO-BHUBANESWAR',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'BHUBANESWAR',
  },
  {
    name: 'Regional Office Mumbai',
    code: 'RO-MUMBAI',
    type: OrganizationType.REGIONAL_OFFICE,
    parentCode: 'NVS-HQ',
    regionCode: 'MUMBAI',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Bhopal',
    code: 'JNV-BHOPAL',
    type: OrganizationType.JNV,
    parentCode: 'RO-BHOPAL',
    stateCode: 'MP',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Chandigarh',
    code: 'JNV-CHANDIGARH',
    type: OrganizationType.JNV,
    parentCode: 'RO-CHANDIGARH',
    stateCode: 'CH',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Hyderabad',
    code: 'JNV-HYDERABAD',
    type: OrganizationType.JNV,
    parentCode: 'RO-HYDERABAD',
    stateCode: 'TS',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Jaipur',
    code: 'JNV-JAIPUR',
    type: OrganizationType.JNV,
    parentCode: 'RO-JAIPUR',
    stateCode: 'RJ',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Lucknow',
    code: 'JNV-LUCKNOW',
    type: OrganizationType.JNV,
    parentCode: 'RO-LUCKNOW',
    stateCode: 'UP',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Patna',
    code: 'JNV-PATNA',
    type: OrganizationType.JNV,
    parentCode: 'RO-PATNA',
    stateCode: 'BR',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Pune',
    code: 'JNV-PUNE',
    type: OrganizationType.JNV,
    parentCode: 'RO-PUNE',
    stateCode: 'MH',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Shillong',
    code: 'JNV-SHILLONG',
    type: OrganizationType.JNV,
    parentCode: 'RO-SHILLONG',
    stateCode: 'ML',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Bhubaneswar',
    code: 'JNV-BHUBANESWAR',
    type: OrganizationType.JNV,
    parentCode: 'RO-BHUBANESWAR',
    stateCode: 'OD',
  },
  {
    name: 'Jawahar Navodaya Vidyalaya Mumbai',
    code: 'JNV-MUMBAI',
    type: OrganizationType.JNV,
    parentCode: 'RO-MUMBAI',
    stateCode: 'MH',
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
  ['AUDIT_LOG_VIEW', 'AUDIT_LOG', 'VIEW', 'View audit logs.'],
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
] as const;

export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  [Role.SUPER_ADMIN]: PERMISSIONS.map(([permissionKey]) => permissionKey),
  [Role.HEADQUARTER]: BUSINESS_PERMISSION_KEYS,
  [Role.NLI]: BUSINESS_PERMISSION_KEYS,
  [Role.REGIONAL]: BUSINESS_PERMISSION_KEYS,
  [Role.JNV]: BUSINESS_PERMISSION_KEYS,
};

export const CONTENT_TYPES = [
  'About Us',
  'Mission',
  'Vision',
  'Objectives',
  'Welcome Message',
  'Notice',
  'Announcement',
  'Circular',
  'News',
] as const;

export const MEDIA_TYPES = [
  'Notice',
  'Circular',
  'Tender',
  'Office Memorandum',
  'Office Order',
  'Notification',
  'Policy',
  'Guideline',
  'Manual',
  'Report',
  'Recruitment',
  'Training Material',
  'Form',
  'Other',
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
    contentType: 'About Us',
    title: 'About Navodaya Vidyalaya Samiti',
    slug: 'about-navodaya-vidyalaya-samiti',
    content:
      'Navodaya Vidyalaya Samiti provides quality education to talented rural children.',
  },
  {
    organizationCode: 'NVS-HQ',
    contentType: 'Mission',
    title: 'Our Mission',
    slug: 'navodaya-vidyalaya-samiti-mission',
    content:
      'To provide good quality modern education to talented children from rural areas.',
  },
  {
    organizationCode: 'RO-BHOPAL',
    contentType: 'Welcome Message',
    title: 'Welcome to Regional Office Bhopal',
    slug: 'welcome-regional-office-bhopal',
    content: 'Welcome to the Regional Office Bhopal information portal.',
  },
  {
    organizationCode: 'JNV-BHOPAL',
    contentType: 'About Us',
    title: 'About School',
    slug: 'about-jnv-bhopal',
    content:
      'Jawahar Navodaya Vidyalaya Bhopal is committed to academic excellence.',
  },
] as const;

export const DEFAULT_SEED_PASSWORD = 'NvsSeed@2026';
export const SAMPLE_PAGE_STATUS = PageStatus.PUBLISHED;
