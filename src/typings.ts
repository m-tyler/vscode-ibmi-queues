import { Range } from "vscode";

export interface IBMiSpooledFile {
  name: string
  number: string
  status?: string
  creationTimestamp?: string
  userData?: string
  size?: number
  totalPages?: number
  pageLength?: string
  qualifiedJobName :string
  jobName?: string
  jobUser?: string
  jobNumber?: string
  formType?: string
  queueLibrary: string
  queue: string
  deviceType?: string
}  
export interface IBMISplfList {
  name: string
  library: string
  text?: string
  type: string
}  
export interface IBMiSplfCounts {
  numberOf: string
  totalPages: string
}  

export type SplfDefaultOpenMode = "withSpaces" | "withoutSpaces";

export interface SplfOpenOptions {
  readonly?: boolean;
  openMode?: SplfDefaultOpenMode;
  position?: Range|undefined;
  pageLength?: string|undefined;
  fileExtension?: string|undefined;
  saveToPath?: string|undefined;
  tempPath?: boolean|undefined;
  qualifiedJobName :string
  spooledFileNumber: string
  spooledFileName: string
  namePattern?: string
}

export interface FuncInfo {
  funcSysLib: string
  funcSysName: string
  text: string
  comment: string
}
export interface ErrorDS {
  errorID?: string
  errorText?: string
}
export interface IBMiMessageQueueMessage {
  messageType?: string
  messageQueueLibrary?: string
  messageQueue?: string
  messageID?: string
  messageSubType?: string
  severity?: string
  messageTimestamp?: string
  messageKey?: string
  messageKeyAssociated?: string
  fromUser?: string
  fromJob?: string
  fromProgram? :string
  messageFileLibrary?: string
  messageFile?: string
  messageTokens?: string
  messageText: string
  messageTextSecondLevel?: string
  messageReply?: string
  messageReplyUser?: string
  messageReplyJob?: string
  messageReplyProgram?: string
  messageReplyTimestamp?: string
}   
export interface IBMiMessageQueueFilter {
  messageQueueLibrary: string
  messageQueue: string
  type: string
}   
export interface IBMiMessageQueue extends IBMiMessageQueueFilter {
  text?: string
  protected?: boolean
}  
export interface IBMiMessageFile{
  messageFileLibrary?: string
  messageFile?: string
  messageText?: string
  messageIDCount?: number
}
export interface IBMiMessageIDDetails{
  messageFileLibrary?: string
  messageFile?: string
  messageId?: string
  messageText?: string
  messageSecondLevelText?: string
  severity?: number
  messageDataCount?: number
  messageData?: string
  logProblem?: string
  creationDate?: Date
  creationLevel?: number
  modificationDate?: Date
  modificationLevel?: number
  messageidccsid?: number
  defaultProgramLibrary?: string
  defaultProgram?: string
  replyType?: string
  replyLength?: number
  replyDecimalPositions?: number
  defaultReply?: string
  validReplyValuesCount?: number
  validReplyValues?: string
  validReplyLowerLimit?: string
  validReplyUpperLimit?: string
  validReplyRelationshipOperator?: string
  validReplyRelationshipValue?: string
  specialReplyValuesCount?: number
  spec96ialReplyValues?: string
  dumpListCount?: number
  dumpList?: string
  alertOption?: string
  alertIndex?: number
}
export interface MsgOpenOptions {
  readonly?: boolean;
}
export interface ObjLockState {
  library:string
  name:string
  objectType:string
  lockState: string
  lockStatus: string
  lockScope: string
  jobName: string
}
export interface ObjAttributes {
  library:string
  name:string
  text: string
}
export interface SearchParms {
  messageQueue: string | undefined,
  messageQueueLibrary?: string,
  term: string | undefined,
  word: string,
}
export interface IBMiUserJobsFilter {
  user: string
}   
export interface IBMiUserJobsUsers extends IBMiUserJobsFilter {
  text?: string,
}
export interface IBMiUserJob {
  jobName?: string,
  jobNameShort?: string,
  jobUser?: string,
  jobNumber?: string,
  jobStatus?: string,
  jobType?: string,
  jobQueueLibrary?: string,
  jobQueueName?: string,
  jobCCSID?: string,
  activeJobStatus?: string,
  jobMessageKey?: string,
  jobMessageQueueLibrary?: string,
  jobMessageQueueName?: string,
  jobEnteredSystemTime?: string,
  jobQueueStatus?: string,
}
export interface DspJobOpenOptions {
  readonly?: boolean;
  printSection?: string;
}