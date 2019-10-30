import axios from "axios";
// import * as api from "../api";
import defaultValue from "./default";

export function login (params) {
  return new Promise((resolve, reject) => {
    axios.post("/login", { params }).then(response => {
      resolve(response.data);
    }, err => {
      resolve(defaultValue.login);
    })
      .catch((error) => {
        resolve(defaultValue.login)
      })
  })
}
export function msgList (params) {
  return new Promise((resolve, reject) => {
    axios.post('/messageList', { params }).then(response => {
      resolve(response.data);
    }, err => {
     
      resolve(defaultValue.msgList);
    })
      .catch((error) => {
        resolve(defaultValue.msgList)
      })
  })
}




export function resourceList (params) {
  return new Promise((resolve, reject) => {
    axios.get("/sys/resource/list", { params }).then(response => {
      resolve(response.data);
    }, err => {
      resolve(defaultValue.resource);
    })
      .catch((error) => {
        resolve(defaultValue.resource)
      })
  })
}
export function roleList (params) {
  return new Promise((resolve, reject) => {
    axios.get("./Vue-Admin/sys/menu/list", { params }).then(response => {
      resolve(response.data);
    }, err => {
      console.log(defaultValue.roleList)
      resolve(defaultValue.roleList);
    })
      .catch((error) => {
        console.log(defaultValue.roleList)
        resolve(defaultValue.roleList)
      })
  })
}

export function userList (params) {
  const userList = {total:defaultValue.userList.total,records:defaultValue.userList.records.reverse()}
  return new Promise((resolve, reject) => {
    axios.get("./Vue-Admin/sys/user/page", { params }).then(response => {
      resolve(response.data);
    }, err => {
      resolve(userList);
    })
      .catch((error) => {
        resolve(userList)
      })
  })
}
