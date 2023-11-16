import { defineStore } from 'pinia'
import Realm from "realm-web";


class SettingsRealm extends Realm.Object {

  static schema: Realm.ObjectSchema = {
    name: "Settings",
    properties: {
    },
    primaryKey: "_id",
  };
}

export const useRealmStore = defineStore('realm', () => {
  // let _realm: Realm | null = null;
  // let settings: SettingsRealm | null = null;

  // async function realm(): Promise<Realm> {
  //   if (_realm === null) {
  //     _realm = await Realm.open({
  //       path: "sbrealm",
  //       schema: [SettingsRealm],
  //     });
  //   }
  //   settings = (await realm()).objects<SettingsRealm>("Settings")[0];
  //   return (_realm as Realm);
  // }

  async function saveSettings(username: string) {
    // (await realm()).write(async () => {
    //   (await realm()).create(SettingsRealm, {
    //     _id: settings?._id,
    //     username,
    //   }, Realm.UpdateMode.Modified);
    // });
  }

  async function getSettings() {
    // return settings;
  }

  return {
    saveSettings,
    getSettings
  };
});