import { assert, expect, test, vi, describe, afterEach } from 'vitest'
import { parsePort, getEnv } from './ika'
//import { getWorkspaceState  } from './ika'
import * as exports from './ika'
import domains from '../domains.json'

const available = Object.values(domains)

describe('reading messages', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    vi.spyOn(exports, 'getWorkspaceState').mockImplementation(async (workspace: string) => ({
        workspace,
        readme: "",
        specification: "",
        services: [],
        isValid: false
    }))

    test('parse port empty', () => {
        assert.equal(parsePort(""), "")
    })
    
    test('parse port $A:8080', () => {
        assert.equal(parsePort("$A:8080"), "$A")
    })
    
    test('parse port 8080:8080', () => {
        assert.equal(parsePort("8080:8080"), "")
    })
    
    test('get env empty', () => {
        assert.deepEqual(getEnv([""], available), {})
    })
    
    test('get env empty two empty items', () => {
        assert.deepEqual(getEnv(["", ""], available), {})
    })
    
    test('get env one item', () => {
        assert.deepEqual(getEnv(["$A:8080"], available), {A: "9000"})
    })
    
    test('get env two items', () => {
        assert.deepEqual(getEnv(["$A:8080", "$B:3000"], available), {A: "9000", B: "9001"})
    })

})
