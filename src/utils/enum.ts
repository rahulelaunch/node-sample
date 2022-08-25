export enum UserData {
  USERNAME = 1,
  EMAIL = 2,
  MOBILE = 3,
  GOOGLE_ID = 4,
  FACEBOOK_ID = 5,
  APPLE_ID = 6,
}

export enum TrustLevel {
  SUPER_TRUSTED = 1,
  ABOVE_AVERAGE_TRUST = 2,
  AVERAGE_TRUST = 3,
  ALMOST_TRUST = 4,
  NOT_VERIFIED = 5,
  NOT_TRUSTED = 6
}

export enum FriendStatus {
  REQUESTED = 1,
  FRIENDS = 2,
  REJECT = 3,
  BLOCK_BY_REQUESTER = 4,
  BLOCK_BY_RECIPIENT = 5,
}

export enum MicroComponent {
  BUSINESS = 1,
  TEXI = 2,
}

export enum Recognise {
  PENDING = 1,
  YESIKNOW = 2,
  DONTKNOW = 3,
  IGNORE = 4
}


export enum TrustStatus {
  PENDING = 1,
  INVALID = 2,
  ACCEPT = 3,
}

export enum TrustFieldDependOn {
  USER_IMAGE = 1,
  USER_ID_NUMBER = 2,
  THREE_X_REFERENCES = 3,
  HOME_ADDRESS = 4,
}

export enum UserType {
  CUSTOMER = 1,
  ADMIN = 2,
}
export enum ImageType {
  USER_IMAGE = 1,
  PROFILE_PIC =2
}

export enum ApplicationAction {
  ACCEPT = 1001,
  REJECT = 2001,
}

export enum Device {
  ANDROID = 1,
  IOS = 2,
  WEB = 3,
}

export enum AdminRole {
  SUPER_ADMIN = 40001,
  DISPUTE_ADMIN = 80001,
  WALLET_ADMIN = 60001,
  JOB_ADMIN = 70001,  
}

export enum UserRole  {
  BUSINESS = 10001,
  CUSTOMER = 40001,
  ADMIN = 80001,  
}

export enum ProviderType {
  COMPANY = 1,
  INDIVIDUAL = 2,
}

export enum Gender {
  MALE = 1,
  FEMALE = 2,
}

export enum msgType {
  TEXT = 1,
  IMAGE = 2,
  AUDIO = 3,
  VIDEO = 4,
  LOCATION = 5,
  DOCUMENT = 6,
}

export enum UserStoryPrivacyEnum {
  MY_CONTACTS = 1,
  SHARE_ONLY_WITH = 2,
  MY_CONTACTS_EXCEPT = 3,
}

export enum ReadRecipientEnum {
  ON = 1,
  OFF = 2,
}

export enum MessageStatusEnum {
  PENDING = 0,
  SENT = 1,
  DELIVERED = 2,
  READ = 3,
  FAILED = 4,
}

export enum TermsCondition {
  YES = 1
}