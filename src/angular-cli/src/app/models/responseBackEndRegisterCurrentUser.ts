export interface responseBackEndRegisterCurrentUser {
  success: string,
  msg: string,
  unique?: {
    username: boolean,
    email: boolean
  }
}
