import request from '@/utils/request'

// 查询材料管理列表
export function listMaterial(query) {
  return request({
    url: '/material/material/list',
    method: 'get',
    params: query
  })
}

// 查询材料管理详细
export function getMaterial(id) {
  return request({
    url: '/material/material/' + id,
    method: 'get'
  })
}

// 新增材料管理
export function addMaterial(data) {
  return request({
    url: '/material/material',
    method: 'post',
    data: data
  })
}

// 修改材料管理
export function updateMaterial(data) {
  return request({
    url: '/material/material',
    method: 'put',
    data: data
  })
}

// 删除材料管理
export function delMaterial(id) {
  return request({
    url: '/material/material/' + id,
    method: 'delete'
  })
}
