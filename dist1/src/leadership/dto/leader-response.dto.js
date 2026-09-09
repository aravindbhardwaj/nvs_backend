"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicLeaderResponseDto = exports.LeaderResponseDto = void 0;
class LeaderResponseDto {
    id;
    leaderNameEnglish;
    leaderNameHindi;
    leaderDesignationEnglish;
    leaderDesignationHindi;
    pictureUrl;
    mimeType;
    extension;
    fileSize;
    display_order;
    isActive;
    createdAt;
    updatedAt;
    isDeleted;
}
exports.LeaderResponseDto = LeaderResponseDto;
class PublicLeaderResponseDto {
    id;
    leader_name_english;
    leader_name_hindi;
    leader_designation_english;
    leader_designation_hindi;
    picture_url;
    display_order;
}
exports.PublicLeaderResponseDto = PublicLeaderResponseDto;
//# sourceMappingURL=leader-response.dto.js.map