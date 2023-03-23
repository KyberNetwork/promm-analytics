import invariant from 'tiny-invariant'

const required = (envKey: string): string => {
  const key = 'REACT_APP_' + envKey
  const envValue = process.env[key]
  invariant(envValue, `env ${key} is missing`)
  return envValue
}

export const KYBERSWAP_URL = required('DMM_SWAP_URL')
export const KS_SETTING_API = required('KS_SETTING_API')
