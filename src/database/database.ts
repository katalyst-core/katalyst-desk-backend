import { Kysely } from 'kysely';
import {
  BasicUserAuthenticationModel,
  MasterProductModel,
  StoreModel,
  UserModel,
  UserSessionModel,
} from './model';

interface Tables {
  user: UserModel;
  basicUserAuthentication: BasicUserAuthenticationModel;
  userSession: UserSessionModel;
  store: StoreModel;
  masterProduct: MasterProductModel;
}

export class Database extends Kysely<Tables> {}
