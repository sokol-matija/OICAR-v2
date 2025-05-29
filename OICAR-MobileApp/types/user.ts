export interface UserDTO {
  idUser: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isAdmin?: boolean;
}

export interface UpdateUserDTO {
  idUser: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
} 