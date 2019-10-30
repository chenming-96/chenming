import axios from "axios";
// import * as api from "./api";
import defaultValue from "./default";



export function menuList (params) {
  return new Promise((resolve, reject) => {
    axios.get("./Vue-Admin/sys/menu/list", { params }).then(response => {
      resolve(response.data);
    }, err => {
      resolve(defaultValue.menuList);
    })
      .catch((error) => {
        resolve(defaultValue.menuList)
      })
  })
}
