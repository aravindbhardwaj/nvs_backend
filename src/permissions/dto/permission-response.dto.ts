export class PermissionResponseDto {
  id: number;
  uuid: string;
  permissionKey: string;
  module: string;
  action: string;
  description: string | null;
  createdAt: Date;
}
