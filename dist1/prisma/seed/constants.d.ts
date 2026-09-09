import { Role } from '@prisma/client';
type OrganizationSeed = {
    name: string;
    code: string;
    typeCode: string;
    parentCode?: string;
    regionCode?: string;
    stateCode?: string;
};
export declare const ORGANIZATION_TYPES: readonly [{
    readonly id: 1;
    readonly code: "HEADQUARTER";
    readonly name: "Headquarters";
}, {
    readonly id: 2;
    readonly code: "NLI";
    readonly name: "NLI";
}, {
    readonly id: 3;
    readonly code: "REGIONAL_OFFICE";
    readonly name: "Regional Office";
}, {
    readonly id: 4;
    readonly code: "JNV";
    readonly name: "JNV";
}, {
    readonly id: 5;
    readonly code: "SUPER_ADMIN";
    readonly name: "Super Administrator";
}];
export declare const REGIONS: readonly [readonly ["Bhopal", "BHOPAL", readonly ["12"]], readonly ["Chandigarh", "CHANDIGARH", readonly ["27"]], readonly ["Hyderabad", "HYDERABAD", readonly ["34"]], readonly ["Jaipur", "JAIPUR", readonly ["20"]], readonly ["Lucknow", "LUCKNOW", readonly ["24"]], readonly ["Patna", "PATNA", readonly ["04"]], readonly ["Pune", "PUNE", readonly ["13"]], readonly ["Shillong", "SHILLONG", readonly ["15"]], readonly ["Bhubaneswar", "BHUBANESWAR", readonly ["18"]], readonly ["Mumbai", "MUMBAI", readonly ["13"]]];
export declare const ORGANIZATIONS: readonly OrganizationSeed[];
export declare const PERMISSIONS: readonly [readonly ["USER_CREATE", "USER", "CREATE", "Create users."], readonly ["USER_VIEW", "USER", "VIEW", "View users."], readonly ["USER_UPDATE", "USER", "UPDATE", "Update users."], readonly ["USER_DELETE", "USER", "DELETE", "Delete users."], readonly ["USER_RESTORE", "USER", "RESTORE", "Restore users."], readonly ["ORGANIZATION_CREATE", "ORGANIZATION", "CREATE", "Create organizations."], readonly ["ORGANIZATION_VIEW", "ORGANIZATION", "VIEW", "View organizations."], readonly ["ORGANIZATION_UPDATE", "ORGANIZATION", "UPDATE", "Update organizations."], readonly ["ORGANIZATION_DELETE", "ORGANIZATION", "DELETE", "Delete organizations."], readonly ["REGION_CREATE", "REGION", "CREATE", "Create regions."], readonly ["REGION_VIEW", "REGION", "VIEW", "View regions."], readonly ["REGION_UPDATE", "REGION", "UPDATE", "Update regions."], readonly ["REGION_DELETE", "REGION", "DELETE", "Delete regions."], readonly ["STATE_VIEW", "STATE", "VIEW", "View states."], readonly ["DISTRICT_VIEW", "DISTRICT", "VIEW", "View districts."], readonly ["CONTENT_TYPE_CREATE", "CONTENT_TYPE", "CREATE", "Create content types."], readonly ["CONTENT_TYPE_VIEW", "CONTENT_TYPE", "VIEW", "View content types."], readonly ["CONTENT_TYPE_UPDATE", "CONTENT_TYPE", "UPDATE", "Update content types."], readonly ["CONTENT_TYPE_DELETE", "CONTENT_TYPE", "DELETE", "Delete content types."], readonly ["MEDIA_TYPE_CREATE", "MEDIA_TYPE", "CREATE", "Create media types."], readonly ["MEDIA_TYPE_VIEW", "MEDIA_TYPE", "VIEW", "View media types."], readonly ["MEDIA_TYPE_UPDATE", "MEDIA_TYPE", "UPDATE", "Update media types."], readonly ["MEDIA_TYPE_DELETE", "MEDIA_TYPE", "DELETE", "Delete media types."], readonly ["PERMISSION_VIEW", "PERMISSION", "VIEW", "View permissions."], readonly ["ROLE_PERMISSION_VIEW", "ROLE_PERMISSION", "VIEW", "View role permissions."], readonly ["ROLE_PERMISSION_UPDATE", "ROLE_PERMISSION", "UPDATE", "Update role permissions."], readonly ["PAGE_CREATE", "PAGE", "CREATE", "Create pages."], readonly ["PAGE_VIEW", "PAGE", "VIEW", "View pages."], readonly ["PAGE_UPDATE", "PAGE", "UPDATE", "Update pages."], readonly ["PAGE_DELETE", "PAGE", "DELETE", "Delete pages."], readonly ["MEDIA_UPLOAD", "MEDIA", "UPLOAD", "Upload media."], readonly ["MEDIA_VIEW", "MEDIA", "VIEW", "View media."], readonly ["MEDIA_DELETE", "MEDIA", "DELETE", "Delete media."], readonly ["BANNER_CREATE", "BANNER", "CREATE", "Create banners."], readonly ["BANNER_VIEW", "BANNER", "VIEW", "View banners."], readonly ["BANNER_UPDATE", "BANNER", "UPDATE", "Update banners."], readonly ["BANNER_DELETE", "BANNER", "DELETE", "Delete banners."], readonly ["GALLERY_CREATE", "GALLERY", "CREATE", "Upload gallery images."], readonly ["GALLERY_VIEW", "GALLERY", "VIEW", "View gallery images."], readonly ["GALLERY_UPDATE", "GALLERY", "UPDATE", "Update gallery images."], readonly ["GALLERY_DELETE", "GALLERY", "DELETE", "Delete gallery images."], readonly ["LEADERSHIP_CREATE", "LEADERSHIP", "CREATE", "Create leaders."], readonly ["LEADERSHIP_VIEW", "LEADERSHIP", "VIEW", "View leaders."], readonly ["LEADERSHIP_UPDATE", "LEADERSHIP", "UPDATE", "Update leaders."], readonly ["LEADERSHIP_DELETE", "LEADERSHIP", "DELETE", "Delete leaders."], readonly ["MODAL_CREATE", "MODAL", "CREATE", "Create modals."], readonly ["MODAL_VIEW", "MODAL", "VIEW", "View modals."], readonly ["MODAL_UPDATE", "MODAL", "UPDATE", "Update modals."], readonly ["MODAL_DELETE", "MODAL", "DELETE", "Delete modals."], readonly ["AUDIT_LOG_VIEW", "AUDIT_LOG", "VIEW", "View audit logs."], readonly ["VISITOR_ANALYTICS_VIEW", "VISITOR_ANALYTICS", "VIEW", "View visitor analytics reports."], readonly ["MENU_CREATE", "MENU", "CREATE", "Create menu items."], readonly ["MENU_VIEW", "MENU", "VIEW", "View menu items."], readonly ["MENU_UPDATE", "MENU", "UPDATE", "Update menu items."]];
export declare const ROLE_PERMISSIONS: Record<Role, readonly string[]>;
export declare const CONTENT_TYPES: readonly [readonly ["ABOUT_US", "About Us"], readonly ["MISSION", "Mission"], readonly ["VISION", "Vision"], readonly ["OBJECTIVES", "Objectives"], readonly ["WELCOME_MESSAGE", "Welcome Message"], readonly ["NOTICE", "Notice"], readonly ["ANNOUNCEMENT", "Announcement"], readonly ["CIRCULAR", "Circular"], readonly ["NEWS", "News"], readonly ["TERMS_CONDITIONS", "Terms & Conditions"], readonly ["PRIVACY_POLICY", "Privacy Policy"], readonly ["COPYRIGHT_POLICY", "Copyright Policy"], readonly ["HYPERLINK_POLICY", "Hyperlink Policy"], readonly ["DISCLAIMER", "Disclaimer"]];
export declare const MEDIA_TYPES: readonly [readonly ["NOTICE", "Notice"], readonly ["CIRCULAR", "Circular"], readonly ["TENDER", "Tender"], readonly ["OFFICE_MEMORANDUM", "Office Memorandum"], readonly ["OFFICE_ORDER", "Office Order"], readonly ["NOTIFICATION", "Notification"], readonly ["POLICY", "Policy"], readonly ["GUIDELINE", "Guideline"], readonly ["MANUAL", "Manual"], readonly ["REPORT", "Report"], readonly ["RECRUITMENT", "Recruitment"], readonly ["TRAINING_MATERIAL", "Training Material"], readonly ["FORM", "Form"], readonly ["OTHER", "Other"]];
export type HeaderMenuSeed = {
    titleEnglish: string;
    mediaTypeCode?: string;
};
export declare const WEBSITE_ORGANIZATION_TYPE_CODES: readonly ["HEADQUARTER", "REGIONAL_OFFICE", "NLI", "JNV"];
export declare const HEADER_MENU_SEEDS: {
    readonly HEADQUARTER: readonly [{
        readonly titleEnglish: "Home";
    }, {
        readonly titleEnglish: "About Us";
    }, {
        readonly titleEnglish: "Admission";
    }, {
        readonly titleEnglish: "Academic";
    }, {
        readonly titleEnglish: "Recruitment";
    }, {
        readonly titleEnglish: "Transfer";
    }, {
        readonly titleEnglish: "Finance";
    }, {
        readonly titleEnglish: "Construction";
    }, {
        readonly titleEnglish: "Committees";
    }, {
        readonly titleEnglish: "Contact Us";
    }];
    readonly REGIONAL_OFFICE: readonly [{
        readonly titleEnglish: "Home";
    }, {
        readonly titleEnglish: "About Us";
    }, {
        readonly titleEnglish: "Admission";
    }, {
        readonly titleEnglish: "Academic";
    }, {
        readonly titleEnglish: "Recruitment";
    }, {
        readonly titleEnglish: "Finance";
    }, {
        readonly titleEnglish: "Transfer";
    }, {
        readonly titleEnglish: "Contact Us";
    }];
    readonly JNV: readonly [{
        readonly titleEnglish: "Home";
    }, {
        readonly titleEnglish: "About Us";
    }, {
        readonly titleEnglish: "Administration";
    }, {
        readonly titleEnglish: "Admission";
    }, {
        readonly titleEnglish: "Academics";
    }, {
        readonly titleEnglish: "Activities";
    }, {
        readonly titleEnglish: "Exams and Results";
    }, {
        readonly titleEnglish: "Tender";
        readonly mediaTypeCode: "TENDER";
    }, {
        readonly titleEnglish: "Contact Us";
    }];
    readonly NLI: readonly [{
        readonly titleEnglish: "Home";
    }, {
        readonly titleEnglish: "About Us";
    }, {
        readonly titleEnglish: "Infrastructure";
    }, {
        readonly titleEnglish: "Training";
    }, {
        readonly titleEnglish: "Faculty";
    }, {
        readonly titleEnglish: "Articles";
    }, {
        readonly titleEnglish: "Publications";
    }, {
        readonly titleEnglish: "Contact Us";
    }];
};
export declare const FOOTER_MENU_SEEDS: readonly [{
    readonly titleEnglish: "Terms & Conditions";
    readonly contentTypeCode: "TERMS_CONDITIONS";
}, {
    readonly titleEnglish: "Privacy Policy";
    readonly contentTypeCode: "PRIVACY_POLICY";
}, {
    readonly titleEnglish: "Copyright Policy";
    readonly contentTypeCode: "COPYRIGHT_POLICY";
}, {
    readonly titleEnglish: "Hyperlink Policy";
    readonly contentTypeCode: "HYPERLINK_POLICY";
}, {
    readonly titleEnglish: "Disclaimer";
    readonly contentTypeCode: "DISCLAIMER";
}];
export declare const SAMPLE_USERS: readonly [{
    readonly name: "Super Administrator";
    readonly username: "super.admin";
    readonly email: "super.admin@nvs.gov.in";
    readonly role: "SUPER_ADMIN";
    readonly organizationCode: "NVS-HQ";
}, {
    readonly name: "Headquarters User";
    readonly username: "headquarters.user";
    readonly email: "headquarters.user@nvs.gov.in";
    readonly role: "HEADQUARTER";
    readonly organizationCode: "NVS-HQ";
}, {
    readonly name: "NLI User";
    readonly username: "nli.user";
    readonly email: "nli.user@nvs.gov.in";
    readonly role: "NLI";
    readonly organizationCode: "NLI-01";
}, {
    readonly name: "Regional User";
    readonly username: "regional.user";
    readonly email: "regional.user@nvs.gov.in";
    readonly role: "REGIONAL";
    readonly organizationCode: "RO-BHOPAL";
}, {
    readonly name: "JNV User";
    readonly username: "jnv.user";
    readonly email: "jnv.user@nvs.gov.in";
    readonly role: "JNV";
    readonly organizationCode: "JNV-BHOPAL";
}];
export declare const SAMPLE_PAGES: readonly [{
    readonly organizationCode: "NVS-HQ";
    readonly contentType: "ABOUT_US";
    readonly title: "About Navodaya Vidyalaya Samiti";
    readonly slug: "about-navodaya-vidyalaya-samiti";
    readonly content: "Navodaya Vidyalaya Samiti provides quality education to talented rural children.";
}, {
    readonly organizationCode: "NVS-HQ";
    readonly contentType: "MISSION";
    readonly title: "Our Mission";
    readonly slug: "navodaya-vidyalaya-samiti-mission";
    readonly content: "To provide good quality modern education to talented children from rural areas.";
}, {
    readonly organizationCode: "RO-BHOPAL";
    readonly contentType: "WELCOME_MESSAGE";
    readonly title: "Welcome to Regional Office Bhopal";
    readonly slug: "welcome-regional-office-bhopal";
    readonly content: "Welcome to the Regional Office Bhopal information portal.";
}, {
    readonly organizationCode: "JNV-BHOPAL";
    readonly contentType: "ABOUT_US";
    readonly title: "About School";
    readonly slug: "about-jnv-bhopal";
    readonly content: "Jawahar Navodaya Vidyalaya Bhopal is committed to academic excellence.";
}];
export declare const DEFAULT_SEED_PASSWORD = "NvsSeed@2026";
export declare const SAMPLE_PAGE_STATUS: "PUBLISHED";
export {};
