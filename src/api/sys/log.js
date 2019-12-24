import request from '@/utils/request'

// 分页查询系统日志列表
export function pageLogs(query) {
  return request({
    url: '/sys/log/page',
    method: 'get',
    params: query
  })
}

// 根据日志编号查询日志信息
export function getLog(id) {
  return request({
    url: '/sys/log/' + id,
    method: 'get'
  })
}

// 删除系统日志
export function removLogs(ids) {
  return request({
    url: '/sys/log/' + ids,
    method: 'delete'
  })
}
