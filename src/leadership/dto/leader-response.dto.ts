export class LeaderResponseDto {
  id: number;
  leaderNameEnglish: string;
  leaderNameHindi: string;
  leaderDesignationEnglish: string;
  leaderDesignationHindi: string;
  pictureUrl: string;
  mimeType: string;
  extension: string;
  fileSize: string;
  display_order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export class PublicLeaderResponseDto {
  id: number;
  leader_name_english: string;
  leader_name_hindi: string;
  leader_designation_english: string;
  leader_designation_hindi: string;
  picture_url: string;
  display_order: number;
}
