/** Parallel to `joint_applicants[]` — row i maps to API fields `joint_applicant_{i+1}_*`. */

export type JointApplicantAttachmentRow = {
  passport: File | null
  nid: File | null
}

/** Same shape as joint rows; maps to `nominee_{01..05}_passport_photo` / `_nid_or_id`. */
export type NomineeAttachmentRow = JointApplicantAttachmentRow

export const MAX_NOMINEE_ATTACHMENT_SLOTS = 5

export function emptyJointApplicantAttachmentRows(): JointApplicantAttachmentRow[] {
  return []
}

export function emptyNomineeAttachmentRows(): NomineeAttachmentRow[] {
  return []
}

/** 1-based index as shown in the form (01–05). */
export function jointApplicantAttachmentLabelIndex(rowIndex: number): string {
  return String(rowIndex + 1).padStart(2, "0")
}
