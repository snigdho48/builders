/**
 * Plot booking application — full Booking Form Draft (Eurostar Group).
 * Stored in `LandBooking.application_data` (JSON). Files use `application-attachments` API.
 */

export type PlotBookingAttachmentSlot = "passport_photo_1" | "nid_or_id" | "booking_money_receipt"

export type PlotBookingAttachmentFiles = Record<PlotBookingAttachmentSlot, File | null>

export const PLOT_BOOKING_ATTACHMENT_SLOTS: PlotBookingAttachmentSlot[] = [
  "passport_photo_1",
  "nid_or_id",
  "booking_money_receipt",
]

export const emptyPlotBookingAttachmentFiles = (): PlotBookingAttachmentFiles => ({
  passport_photo_1: null,
  nid_or_id: null,
  booking_money_receipt: null,
})

/** Full nominee / co-nominee block per draft (Personal + Contact + Attachment). */
export type NomineePersonDraft = {
  relation: string
  ownership_proportion_pct: string
  full_name_en: string
  full_name_bn: string
  father_name_en: string
  father_name_bn: string
  mother_name_en: string
  mother_name_bn: string
  date_of_birth: string
  blood_group: string
  gender: string
  religion: string
  nationality: string
  is_nrb: boolean
  occupation_type: string
  occupation_other: string
  designation: string
  department: string
  organization_name: string
  marital_status: string
  marriage_date: string
  spouse_name_en: string
  spouse_name_bn: string
  mobile_phone: string
  email: string
  mailing_address_en: string
  permanent_address_en: string
  photo_identity_nid: boolean
  photo_identity_passport: boolean
  photo_identity_driving_license: boolean
  photo_identity_birth_certificate: boolean
  photo_identity_other: string
}

export type RepresentativeDraft = {
  relation: string
  full_name_en: string
  occupation_type: string
  occupation_other: string
  designation: string
  department: string
  organization_name: string
  mobile_phone: string
  email: string
  mailing_address_en: string
  permanent_address_en: string
  photo_identity_nid: boolean
  photo_identity_passport: boolean
  photo_identity_driving_license: boolean
  photo_identity_birth_certificate: boolean
  photo_identity_other: string
}

export type OfficialUseDraft = {
  payment_mode_at_once: boolean
  payment_mode_installment: boolean
  payment_booking_money: boolean
  payment_down_payment: boolean
  payment_part_payment: boolean
  payment_full_payment: boolean
  payment_full_payment_percent: string
  amount_taka: string
  amount_on_or_before_date: string
  amount_in_words: string
  instrument_type_note: string
  cash_cheque_po_dd_no: string
  cash_cheque_date: string
  account_name: string
  bank_name: string
  branch_name: string
  routing_no: string
  swift_code: string
  num_installment_options: string
  per_installment_taka: string
  installment_start_from: string
}

export function emptyNomineePersonDraft(): NomineePersonDraft {
  return {
    relation: "",
    ownership_proportion_pct: "",
    full_name_en: "",
    full_name_bn: "",
    father_name_en: "",
    father_name_bn: "",
    mother_name_en: "",
    mother_name_bn: "",
    date_of_birth: "",
    blood_group: "",
    gender: "",
    religion: "",
    nationality: "",
    is_nrb: false,
    occupation_type: "",
    occupation_other: "",
    designation: "",
    department: "",
    organization_name: "",
    marital_status: "",
    marriage_date: "",
    spouse_name_en: "",
    spouse_name_bn: "",
    mobile_phone: "",
    email: "",
    mailing_address_en: "",
    permanent_address_en: "",
    photo_identity_nid: false,
    photo_identity_passport: false,
    photo_identity_driving_license: false,
    photo_identity_birth_certificate: false,
    photo_identity_other: "",
  }
}

export function emptyRepresentativeDraft(): RepresentativeDraft {
  return {
    relation: "",
    full_name_en: "",
    occupation_type: "",
    occupation_other: "",
    designation: "",
    department: "",
    organization_name: "",
    mobile_phone: "",
    email: "",
    mailing_address_en: "",
    permanent_address_en: "",
    photo_identity_nid: false,
    photo_identity_passport: false,
    photo_identity_driving_license: false,
    photo_identity_birth_certificate: false,
    photo_identity_other: "",
  }
}

export function emptyOfficialUseDraft(): OfficialUseDraft {
  return {
    payment_mode_at_once: false,
    payment_mode_installment: false,
    payment_booking_money: false,
    payment_down_payment: false,
    payment_part_payment: false,
    payment_full_payment: false,
    payment_full_payment_percent: "",
    amount_taka: "",
    amount_on_or_before_date: "",
    amount_in_words: "",
    instrument_type_note: "",
    cash_cheque_po_dd_no: "",
    cash_cheque_date: "",
    account_name: "",
    bank_name: "",
    branch_name: "",
    routing_no: "",
    swift_code: "",
    num_installment_options: "",
    per_installment_taka: "",
    installment_start_from: "",
  }
}

export type JointApplicantRow = {
  name_en: string
  name_bn: string
}

export type PlotBookingApplicationData = {
  form_id_no: string
  form_file_no: string

  applicant_full_name_en: string
  applicant_full_name_bn: string
  father_name_en: string
  father_name_bn: string
  mother_name_en: string
  mother_name_bn: string
  date_of_birth: string
  blood_group: string
  gender: string
  religion: string
  national_id: string
  passport_number: string
  nationality: string
  is_nrb: boolean
  occupation_type: string
  occupation_other: string
  designation: string
  department: string
  organization_name: string
  marital_status: string
  marriage_date: string
  spouse_name_en: string
  spouse_name_bn: string

  contact_mobile_phone: string
  contact_email: string
  mailing_present_address_en: string
  permanent_address_en: string

  applicant_photo_identity_nid: boolean
  applicant_photo_identity_passport: boolean
  applicant_photo_identity_driving_license: boolean
  applicant_photo_identity_birth_certificate: boolean
  applicant_photo_identity_other: string

  /** Selected plot detail */
  plot_detail_project_name: string
  plot_detail_property_type: string
  plot_detail_location_address: string
  applicant_ownership_mode: "individual" | "joint"
  selected_plot_no: string
  plot_size_katha: string
  plot_unit_label: string
  plot_road_no: string
  plot_road_size: string
  plot_sector_or_block: string
  plot_category: string
  plot_position: string
  plot_facing: string
  /** Joint owners — add rows as needed (Joint application only). */
  joint_applicants: JointApplicantRow[]

  /** Nominees — add blocks with “Add nominee”. */
  nominees: NomineePersonDraft[]

  representative: RepresentativeDraft

  /** Optional banking (not on paper draft — refunds / payouts). */
  bank_name: string
  bank_branch: string
  account_name: string
  account_number: string
  account_type: string
  routing_number: string

  official_use: OfficialUseDraft

  instruction_if_any: string

  declares_booking_policy_read_full: boolean
  declares_english_declaration_read: boolean
  declares_information_provided_truthfully: boolean
  declares_read_and_agreed_project_terms: boolean
  declares_company_may_accept_or_reject_application: boolean
}

export const emptyPlotBookingApplicationData = (): PlotBookingApplicationData => ({
  form_id_no: "",
  form_file_no: "",

  applicant_full_name_en: "",
  applicant_full_name_bn: "",
  father_name_en: "",
  father_name_bn: "",
  mother_name_en: "",
  mother_name_bn: "",
  date_of_birth: "",
  blood_group: "",
  gender: "",
  religion: "",
  national_id: "",
  passport_number: "",
  nationality: "Bangladeshi",
  is_nrb: false,
  occupation_type: "",
  occupation_other: "",
  designation: "",
  department: "",
  organization_name: "",
  marital_status: "",
  marriage_date: "",
  spouse_name_en: "",
  spouse_name_bn: "",

  contact_mobile_phone: "",
  contact_email: "",
  mailing_present_address_en: "",
  permanent_address_en: "",

  applicant_photo_identity_nid: false,
  applicant_photo_identity_passport: false,
  applicant_photo_identity_driving_license: false,
  applicant_photo_identity_birth_certificate: false,
  applicant_photo_identity_other: "",

  plot_detail_project_name: "",
  plot_detail_property_type: "",
  plot_detail_location_address: "",
  applicant_ownership_mode: "individual",
  selected_plot_no: "",
  plot_size_katha: "",
  plot_unit_label: "",
  plot_road_no: "",
  plot_road_size: "",
  plot_sector_or_block: "",
  plot_category: "",
  plot_position: "",
  plot_facing: "",
  joint_applicants: [],

  nominees: [],

  representative: emptyRepresentativeDraft(),

  bank_name: "",
  bank_branch: "",
  account_name: "",
  account_number: "",
  account_type: "savings",
  routing_number: "",

  official_use: emptyOfficialUseDraft(),

  instruction_if_any: "",

  declares_booking_policy_read_full: false,
  declares_english_declaration_read: false,
  declares_information_provided_truthfully: false,
  declares_read_and_agreed_project_terms: false,
  declares_company_may_accept_or_reject_application: false,
})
