import { PrismaClient, Prisma } from '@prisma/client';
import { config } from 'dotenv';

config({
  path: process.env.DOTENV_CONFIG_PATH ?? '.env',
  override: true,
});
const prisma = new PrismaClient();

const TARGET_MASTER_NAMES = [
  'Home',
  'About Us',
  'Secretary',
  "Commissioner's Message",
  "Deputy Commissioner's Message",
  "Director's Desk",
  "Principal's Desk",
  'Vision & Mission',
  'Executive Committee',
  'Adminograph of NVS',
  'Establishment of JNVs',
  'About JNV',
  'About the Institute',
  'Administration',
  'Staff Strength of RO and JNV (Post Wise)',
  'Staff',
  'Teaching Staff',
  'Non-Teaching Staff',
  'Success Stories',
  'Student Success Stories',
  'Staff Success Stories',
  'Vidyalaya Management Committee',
  'Vidyalaya Advisory Committee',
  'Vidyalaya Level Committees',
  'Student Council Members',
  'Successive Principals',
  'Successive Vice Principals',
  'Admission',
  'Enrolment Policy',
  'JNVST Statistics',
  'Admission Notifications',
  'Academic',
  'School Administration',
  'Facilities in JNVs',
  'Students',
  'Teachers',
  'Parent Teacher Council',
  "Redressal of Students' Grievances",
  'Academic Excellence',
  'Student Strength',
  'Migration of Students',
  'Academic Schedule',
  'ICT in Education',
  'Facilities',
  'Annual Calendar',
  'Class Teacher',
  'House Masters / Mistress',
  'Career Guidance',
  'Our Pride',
  'Activities',
  'Co-Curricular',
  'Co-Curricular Activities',
  'Flagship Program',
  'Pace Setting',
  'Pace Setting Activities',
  'Games and Sports',
  'Club Activities',
  'Art in Education',
  'Youth Parliament',
  'NCC',
  'Scouts and Guides',
  'NSS',
  'Green Corps',
  'Morning Assembly',
  'Cleanliness',
  'Achievements',
  'Other Activities',
  'Training',
  'Training in NVS at a Glance',
  'Training Centres',
  'Training Manual',
  'Annual Training Calendar',
  'Training Calendar',
  'Training Circulars',
  'Training Offered',
  'Training Structure',
  'Training Reports',
  'Resource Material',
  'Guidelines for Trainees',
  'Ground Rules',
  'Instructions',
  'Exams and Results',
  'Class Wise Syllabus',
  'Learning Resources',
  'Sample Papers',
  'Projects and Assignments',
  'Results',
  'Notifications',
  'Recruitment',
  'Recruitment Rules',
  'Advertisement / Vacancies',
  'Fill Up Online Application',
  'Syllabus',
  'Admit Card',
  'Exam / Interview / Skill Test Notice',
  'Answer Keys',
  'LDE',
  'LDE Notification',
  'LDE Result',
  'Transfer',
  'Transfer Policy',
  'Transfer Notification',
  'Transfer Lists / Orders',
  'Finance',
  'Budget and Accounts',
  'Expenditure',
  'National Pension Scheme',
  'CPF Scheme',
  'Finance Circulars',
  'Construction',
  'Construction Activities',
  'Construction Circulars',
  'Solar Initiatives',
  'Scheme',
  'PPAs',
  'Gallery',
  'Downloads',
  'Committees',
  'Finance Committee',
  'Academic Advisory Committee',
  'NVS',
  'Infrastructure',
  'Lecture Hall',
  'Conference',
  'Library',
  'Hostel',
  'Cafeteria',
  'Faculty',
  'Internal Faculty',
  'External Faculty',
  'Articles',
  'Publications',
  'Tender',
  'Tender Notice',
  'Terms & Conditions',
  'Tender Forms',
  'Approved Tender Rates',
  'Contact Us',
  'NVS Headquarters',
  'Contact Details of Officers',
  'Complete Address and Contact Information',
  'Regional Offices',
  'Regional Office',
  'RO-wise JNVs',
  'Directory of JNVs',
  'JNV',
  'NLIs',
] as const;

const LEGACY_FOOTER_CONTENT_TYPES = [
  ['PRIVACY_POLICY', 'Privacy Policy'],
  ['COPYRIGHT_POLICY', 'Copyright Policy'],
  ['HYPERLINK_POLICY', 'Hyperlink Policy'],
  ['DISCLAIMER', 'Disclaimer'],
] as const;

type MenuSeed = {
  titleEnglish: string;
  contentTypeCode?: string;
  mediaTypeCode?: string;
};

const HEADER_MENU_SEEDS: Readonly<Record<string, readonly MenuSeed[]>> = {
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
};

const FOOTER_MENU_SEEDS: readonly MenuSeed[] = [
  {
    titleEnglish: 'Terms & Conditions',
    contentTypeCode: 'TERMS_AND_CONDITIONS',
  },
  { titleEnglish: 'Privacy Policy', contentTypeCode: 'PRIVACY_POLICY' },
  { titleEnglish: 'Copyright Policy', contentTypeCode: 'COPYRIGHT_POLICY' },
  { titleEnglish: 'Hyperlink Policy', contentTypeCode: 'HYPERLINK_POLICY' },
  { titleEnglish: 'Disclaimer', contentTypeCode: 'DISCLAIMER' },
];

function codeFor(name: string): string {
  return name
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/\//g, ' ')
    .replace(/[’']/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function upsertMasterData(
  transaction: Prisma.TransactionClient,
): Promise<{
  contentTypesByCode: Map<string, number>;
  mediaTypesByCode: Map<string, number>;
}> {
  for (const [displayOrder, nameEnglish] of TARGET_MASTER_NAMES.entries()) {
    const code = codeFor(nameEnglish);
    await transaction.contentType.upsert({
      where: { nameEnglish },
      update: {
        code,
        displayOrder: displayOrder + 1,
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
      },
      create: {
        nameEnglish,
        code,
        nameHindi: null,
        displayOrder: displayOrder + 1,
      },
    });
    await transaction.mediaType.upsert({
      where: { nameEnglish },
      update: {
        code,
        displayOrder: displayOrder + 1,
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
      },
      create: {
        nameEnglish,
        code,
        nameHindi: null,
        displayOrder: displayOrder + 1,
      },
    });
  }

  for (const [code, nameEnglish] of LEGACY_FOOTER_CONTENT_TYPES) {
    await transaction.contentType.upsert({
      where: { nameEnglish },
      update: {
        code,
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
      },
      create: { nameEnglish, code, nameHindi: null, displayOrder: 0 },
    });
  }

  const [contentTypes, mediaTypes] = await Promise.all([
    transaction.contentType.findMany({
      where: { isDeleted: false },
      select: { id: true, code: true },
    }),
    transaction.mediaType.findMany({
      where: { isDeleted: false },
      select: { id: true, code: true },
    }),
  ]);

  return {
    contentTypesByCode: new Map(
      contentTypes.flatMap(({ id, code }) => (code ? [[code, id]] : [])),
    ),
    mediaTypesByCode: new Map(
      mediaTypes.flatMap(({ id, code }) => (code ? [[code, id]] : [])),
    ),
  };
}

async function upsertMenu(
  transaction: Prisma.TransactionClient,
  input: {
    organizationTypeId: number;
    menuLocation: number;
    titleEnglish: string;
    contentTypeId: number | null;
    mediaTypeId: number | null;
    displayOrder: number;
    userId: number | null;
  },
): Promise<void> {
  const existing = await transaction.menu.findFirst({
    where: {
      organizationTypeId: input.organizationTypeId,
      menuLocation: input.menuLocation,
      parentMenuId: null,
      titleEnglish: input.titleEnglish,
    },
    orderBy: { id: 'asc' },
    select: { id: true },
  });

  const data = {
    titleHindi: null,
    contentTypeId: input.contentTypeId,
    mediaTypeId: input.mediaTypeId,
    externalUrl: null,
    linkTarget: 1,
    displayOrder: input.displayOrder,
    isActive: true,
    isDeleted: false,
    deletedAt: null,
    deletedById: null,
    updatedById: input.userId,
  };

  if (existing) {
    await transaction.menu.update({ where: { id: existing.id }, data });
    return;
  }

  await transaction.menu.create({
    data: {
      organizationTypeId: input.organizationTypeId,
      menuLocation: input.menuLocation,
      parentMenuId: null,
      titleEnglish: input.titleEnglish,
      createdById: input.userId,
      ...data,
    },
  });
}

async function seedMenus(
  transaction: Prisma.TransactionClient,
  contentTypesByCode: Map<string, number>,
  mediaTypesByCode: Map<string, number>,
): Promise<void> {
  const [organizationTypes, superAdmin] = await Promise.all([
    transaction.organizationType.findMany({
      where: { code: { in: Object.keys(HEADER_MENU_SEEDS) } },
      select: { id: true, code: true },
    }),
    transaction.user.findUnique({
      where: { email: 'super.admin@nvs.gov.in' },
      select: { id: true },
    }),
  ]);

  const organizationTypeIds = new Map(
    organizationTypes.map(({ id, code }) => [code, id]),
  );
  const userId = superAdmin?.id ?? null;

  for (const [organizationTypeCode, headerMenus] of Object.entries(
    HEADER_MENU_SEEDS,
  )) {
    const organizationTypeId = organizationTypeIds.get(organizationTypeCode);
    if (!organizationTypeId) {
      throw new Error(
        `Missing organization type required for menu seeding: ${organizationTypeCode}.`,
      );
    }

    for (const [index, menu] of headerMenus.entries()) {
      const mediaTypeId = menu.mediaTypeCode
        ? mediaTypesByCode.get(menu.mediaTypeCode)
        : null;
      if (menu.mediaTypeCode && !mediaTypeId) {
        throw new Error(
          `Missing media type required for menu seeding: ${menu.mediaTypeCode}.`,
        );
      }

      await upsertMenu(transaction, {
        organizationTypeId,
        menuLocation: 1,
        titleEnglish: menu.titleEnglish,
        contentTypeId: null,
        mediaTypeId: mediaTypeId ?? null,
        displayOrder: index + 1,
        userId,
      });
    }

    for (const [index, menu] of FOOTER_MENU_SEEDS.entries()) {
      const contentTypeId = menu.contentTypeCode
        ? contentTypesByCode.get(menu.contentTypeCode)
        : null;
      if (menu.contentTypeCode && !contentTypeId) {
        throw new Error(
          `Missing content type required for menu seeding: ${menu.contentTypeCode}.`,
        );
      }

      await upsertMenu(transaction, {
        organizationTypeId,
        menuLocation: 2,
        titleEnglish: menu.titleEnglish,
        contentTypeId: contentTypeId ?? null,
        mediaTypeId: null,
        displayOrder: index + 1,
        userId,
      });
    }
  }
}

async function validateSeed(
  transaction: Prisma.TransactionClient,
): Promise<void> {
  const targetCodes = TARGET_MASTER_NAMES.map(codeFor);
  const [contentCount, mediaCount] = await Promise.all([
    transaction.contentType.count({
      where: { code: { in: targetCodes }, isDeleted: false },
    }),
    transaction.mediaType.count({
      where: { code: { in: targetCodes }, isDeleted: false },
    }),
  ]);

  if (
    contentCount !== TARGET_MASTER_NAMES.length ||
    mediaCount !== TARGET_MASTER_NAMES.length
  ) {
    throw new Error(
      `Master-data validation failed: content=${contentCount}/${TARGET_MASTER_NAMES.length}, media=${mediaCount}/${TARGET_MASTER_NAMES.length}.`,
    );
  }
}

async function main(): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const { contentTypesByCode, mediaTypesByCode } =
      await upsertMasterData(transaction);
    await seedMenus(transaction, contentTypesByCode, mediaTypesByCode);
    await validateSeed(transaction);
  });

  console.log(
    `Seeded ${TARGET_MASTER_NAMES.length} Content Types, ${TARGET_MASTER_NAMES.length} Media Types, and 55 first-level menus.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
