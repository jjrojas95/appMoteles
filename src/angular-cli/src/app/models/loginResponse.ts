export interface LoginResponseRoute {
  success: string,
  token?: string,
  msg?: string,
  user?: {
    id: string,
    name: string,
    username: string,
    email: string,
    activate: boolean,
    role: string
  };
}
