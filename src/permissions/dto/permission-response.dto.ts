export class PermissionResponseDto {
  id: number;
  permissionKey: string;
  module: string;
  action: string;
  description: string | null;
  createdAt: Date;
}
