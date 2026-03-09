import type { DocumentPageContent } from "@/components/DocumentPage";

export const legalNoticeContent: DocumentPageContent = {
  label: "Legal Notice",
  title: "Legal Notice For Hot Barcelona",
  intro:
    "The following legal notice manifest the conditions of access and use of the HotBarcelona web portal, hereafter known as the WEB PORTAL.",
  summaryCards: [
    { label: "Owner", value: "HL Publication 2026 SL" },
    { label: "Access", value: "Strictly 18+ only" },
    { label: "Contact", value: "support@hotbarcelona.com" },
  ],
  sections: [
    {
      eyebrow: "Liability And Contact",
      title: "Holder Information",
      paragraphs: [
        "This web portal is the property of HL Publication 2026 SL, hereafter known as the HOLDER, with the following contact information:",
      ],
      list: [
        "Address: Edf. Mediterraneo 4-2, C/ EDf. Mediterraneo 1, 29692 Marbella (Malaga)",
        "Phone: +34 622363966",
        "Mail: support@hotbarcelona.com",
      ],
    },
    {
      title: "Access Restriction",
      paragraphs: [
        "Access to the WEB PORTAL is strictly and without exception only permitted to persons 18 years of age or older and is completely forbidden to minors. Only persons aged 18+ confer the status of user of the WEB PORTAL, hereafter known as the USER.",
      ],
    },
    {
      title: "Acceptance Of Conditions",
      paragraphs: [
        "Entering the WEB PORTAL means that any USER accepts unconditionally the conditions and normative stated in the WEB PORTAL's legal notice.",
        "The WEB PORTAL retains the right and privilege to prohibit and exclude any USER who breaches the general and legal regulations of the WEB PORTAL.",
      ],
    },
    {
      title: "Rights And Ownership",
      paragraphs: [
        "All rights, including copyrights to the WEB PORTAL and its topics, pertain to the HOLDER of the site, who has obtained the equivalent utilization rights from advertisers and authors, who are therefore legally and morally protected by law.",
      ],
    },
    {
      title: "Permitted Use",
      paragraphs: [
        "The USER is only permitted to use and view the WEB PORTAL topics as manifested by the current and actual law, and explicitly for personal and non-commercial use.",
        "Any other use by the USER of the WEB PORTAL topics is totally prohibited by the HOLDER and/or the advertisers and authors.",
      ],
    },
    {
      title: "Good Faith And Violations",
      paragraphs: [
        "The USER is expected to interact in good faith and not to cause any violation through the use of the WEB PORTAL of the current actual law.",
        "Any breach, such as unauthorized use of topics of the WEB PORTAL or violation of the legal rights of the HOLDER and/or current law, may lead to immediate legal denouncement and possible prosecution.",
      ],
    },
    {
      title: "Portal Changes",
      paragraphs: [
        "As HOLDER, the WEB PORTAL keeps the option at any possible time to change, alter, and/or remove any published topics on the WEB PORTAL, including the content of this legal notice.",
        "Furthermore, the HOLDER reserves the right, without prior announcement, to interrupt and/or abolish temporarily or permanently the WEB PORTAL.",
      ],
    },
    {
      title: "Third-Party Publications",
      paragraphs: [
        "The HOLDER does not assure the absence of technical publishing misconceptions and/or any other mistakes visible on the WEB PORTAL, nor accountability for any lack of trustworthiness and/or incorrect information posted by third parties, hereafter known as ADVERTISERS, published on the WEB PORTAL.",
        "Each ADVERTISER takes complete accountability for its own publication and all topics stated within it when published on the WEB PORTAL.",
      ],
    },
  ],
  asideTitle: "Need Clarification Or A Manual Update?",
  asideParagraphs: [
    "Please make a space between each paragraph when the legal notice is reviewed or edited, as requested.",
    "It can take time to write and edit legal text because the wording must be original and carefully adapted rather than copied directly.",
  ],
};

export const privacyPolicyContent: DocumentPageContent = {
  label: "Privacy Policy",
  title: "Privacy Policy For Hot Barcelona",
  intro:
    "This privacy policy explains in a clear way how information may be collected, stored, and used when users interact with the Hot Barcelona web portal.",
  summaryCards: [
    { label: "Support", value: "support@hotbarcelona.com" },
    { label: "Audience", value: "Adults 18+ only" },
    { label: "Scope", value: "Portal, contact, account, and profile flows" },
  ],
  sections: [
    {
      eyebrow: "Controller",
      title: "Who Manages The Portal",
      paragraphs: [
        "The web portal is operated by HL Publication 2026 SL. For privacy-related questions, requests, or updates, users may contact support@hotbarcelona.com.",
      ],
    },
    {
      title: "What Information May Be Collected",
      paragraphs: [
        "Depending on how the portal is used, the site may process contact details, account information, submitted profile details, communication records, technical browser data, and other data necessary to operate the platform.",
        "When users contact the portal or create or manage listings, the information entered into forms may be stored for service, moderation, safety, and support purposes.",
      ],
    },
    {
      title: "How Information Is Used",
      paragraphs: [
        "Information may be used to operate the portal, manage user access, review submitted listings, respond to support requests, improve reliability, prevent abuse, and comply with legal obligations.",
        "The portal may also use technical information to maintain security, monitor performance, and resolve operational errors.",
      ],
    },
    {
      title: "Cookies And Local Storage",
      paragraphs: [
        "The portal may use cookies, session storage, and local storage to support language preferences, session behavior, login flows, age-gate checks, and other essential site features.",
        "These tools are used to improve usability and keep the portal functioning consistently across visits and devices.",
      ],
    },
    {
      title: "Third-Party Services",
      paragraphs: [
        "Some technical functions may rely on third-party providers, such as image hosting, authentication, analytics, or translation-related tools where applicable.",
        "When such services are used, data may be processed only to the extent necessary to provide the relevant function.",
      ],
    },
    {
      title: "Retention And Security",
      paragraphs: [
        "Information is retained only for as long as reasonably necessary for portal operation, support, moderation, legal obligations, and dispute handling.",
        "Reasonable technical and organizational measures are used to protect stored information, although no online system can guarantee absolute security.",
      ],
    },
    {
      title: "User Rights",
      paragraphs: [
        "Users may request access, correction, or deletion of their personal information where applicable, subject to legal, operational, and verification requirements.",
        "Privacy-related requests should be sent to support@hotbarcelona.com so they can be reviewed and handled appropriately.",
      ],
    },
    {
      title: "Age Restriction",
      paragraphs: [
        "This portal is strictly intended for adults aged 18 and above. Minors must not access or use the platform, and no data should knowingly be submitted by minors.",
      ],
    },
  ],
  asideTitle: "Privacy Requests And Support",
  asideParagraphs: [
    "If a user needs a correction, deletion request, or clarification about how data is handled, the support team can review the request through the official contact address.",
    "This privacy policy may be updated when portal features, operational processes, or legal requirements change.",
  ],
};
