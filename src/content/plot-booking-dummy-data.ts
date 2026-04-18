/**
 * Sample data for local QA / dev — not for production display.
 * Enables one-click fill on the plot booking application page (dev only).
 */

import {
  emptyNomineePersonDraft,
  emptyPlotBookingApplicationData,
  type NomineePersonDraft,
  type PlotBookingApplicationData,
  type PlotBookingAttachmentFiles,
} from "@/content/plot-booking-application-form"
import type { JointApplicantAttachmentRow, NomineeAttachmentRow } from "@/content/plot-booking-joint-attachments"

/** Minimal PDF bytes accepted by most validators (single empty page object). */
const MINIMAL_PDF = new Uint8Array(
  new TextEncoder().encode(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj trailer<</Root 1 0 R/Size 4>>\n%%EOF\n",
  ),
)

function tinyPdf(name: string): File {
  return new File([MINIMAL_PDF], name, { type: "application/pdf", lastModified: Date.now() })
}

/** Three placeholder PDFs for passport, NID, booking receipt uploads. */
export function dummyPlotBookingAttachmentFiles(): PlotBookingAttachmentFiles {
  return {
    passport_photo_1: tinyPdf("dummy-passport-photo.pdf"),
    nid_or_id: tinyPdf("dummy-nid.pdf"),
    booking_money_receipt: tinyPdf("dummy-booking-receipt.pdf"),
  }
}

function dummyNominee(): NomineePersonDraft {
  const n = emptyNomineePersonDraft()
  return {
    ...n,
    relation: "Brother",
    ownership_proportion_pct: "50",
    full_name_en: "MD. SAMPLE NOMINEE",
    full_name_bn: "নমিনি নমুনা",
    father_name_en: "MD. SAMPLE FATHER",
    father_name_bn: "পিতার নাম",
    mother_name_en: "MST. SAMPLE MOTHER",
    mother_name_bn: "মাতার নাম",
    date_of_birth: "1992-06-15",
    blood_group: "B+",
    gender: "male",
    religion: "Islam",
    nationality: "Bangladeshi",
    is_nrb: false,
    occupation_type: "pvt_service",
    occupation_other: "",
    designation: "Officer",
    department: "Operations",
    organization_name: "Sample Ltd.",
    marital_status: "Married",
    marriage_date: "2018-01-10",
    spouse_name_en: "MST. SAMPLE SPOUSE",
    spouse_name_bn: "স্বামী/স্ত্রী",
    mobile_phone: "+8801711122233",
    email: "nominee.sample@example.com",
    mailing_address_en: "House 12, Road 5, Dhaka 1212",
    permanent_address_en: "Same as mailing",
    photo_identity_nid: true,
    photo_identity_passport: false,
    photo_identity_driving_license: false,
    photo_identity_birth_certificate: false,
    photo_identity_other: "",
  }
}

/** Realistic sample application (individual + one nominee). Plot fields may be overwritten by map selection + page effects. */
export function dummyPlotBookingApplicationData(): PlotBookingApplicationData {
  const base = emptyPlotBookingApplicationData()
  return {
    ...base,
    applicant_full_name_en: "MD. SAMPLE APPLICANT",
    applicant_full_name_bn: "এমডি নমুনা আবেদনকারী",
    father_name_en: "MD. SAMPLE FATHER",
    father_name_bn: "পিতার নাম নমুনা",
    mother_name_en: "MST. SAMPLE MOTHER",
    mother_name_bn: "মাতার নাম নমুনা",
    date_of_birth: "1990-03-22",
    blood_group: "O+",
    gender: "male",
    religion: "Islam",
    national_id: "1234567890123",
    passport_number: "A12345678",
    nationality: "Bangladeshi",
    is_nrb: false,
    occupation_type: "pvt_service",
    occupation_other: "",
    designation: "Senior Manager",
    department: "Finance",
    organization_name: "Eurostar Demo Co.",
    marital_status: "Unmarried",
    marriage_date: "",
    spouse_name_en: "",
    spouse_name_bn: "",

    contact_mobile_phone: "+8801812345678",
    contact_email: "applicant.sample@example.com",
    mailing_present_address_en: "Flat 4B, Sample Tower, Gulshan 2, Dhaka 1212",
    permanent_address_en: "Village: Demo, District: Dhaka",

    applicant_photo_identity_nid: true,
    applicant_photo_identity_passport: false,
    applicant_photo_identity_driving_license: false,
    applicant_photo_identity_birth_certificate: false,
    applicant_photo_identity_other: "",

    plot_detail_project_name: "",
    plot_detail_property_type: "",
    plot_detail_location_address: "",
    applicant_ownership_mode: "individual",
    plot_road_no: "12",
    plot_road_size: "40 ft",
    plot_sector_or_block: "A",
    plot_category: "Residential",
    plot_position: "Corner",
    plot_facing: "North",

    joint_applicants: [],

    nominees: [dummyNominee()],

    bank_name: "Demo Bank Ltd.",
    bank_branch: "Gulshan",
    account_name: "MD. SAMPLE APPLICANT",
    account_number: "0123456789012",
    account_type: "savings",
    routing_number: "123456789",

    instruction_if_any: "Dummy submission for QA — safe to discard.",

    declares_booking_policy_read_full: true,
    declares_english_declaration_read: true,
    declares_information_provided_truthfully: true,
    declares_read_and_agreed_project_terms: true,
    declares_company_may_accept_or_reject_application: true,
  }
}

/** Nominee passport + NID placeholders (one nominee). */
export function dummyNomineeAttachmentRows(): NomineeAttachmentRow[] {
  return [{ passport: tinyPdf("dummy-nominee-photo.pdf"), nid: tinyPdf("dummy-nominee-nid.pdf") }]
}

export function dummyJointApplicantAttachmentRows(): JointApplicantAttachmentRow[] {
  return []
}
