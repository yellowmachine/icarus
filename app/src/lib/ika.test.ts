import { assert, expect, test, vi, describe, afterEach } from 'vitest'
import domains from '../domains.json'
import { parsePort, getEnv, getStates } from './utils'
import * as utils from './utils'

const available = Object.values(domains)


describe('reading messages', () => {
    
    afterEach(() => {
      vi.restoreAllMocks()
    })

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

    test('get states', async () => {
        const dirs = vi.spyOn(utils, 'getWorkspaces');
        dirs.mockImplementation(async ()=>['test-1'])

        const x = vi.spyOn(utils, 'getWorkspaceState');

        const state = await getStates()

        assert.deepEqual(state, [{
            workspace: 'test-1',
            readme: "a",
            specification: "b",
            isValid: false,
            services: []
        }])
    })

})
