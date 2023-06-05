import { assert, expect, test, vi, describe, afterEach } from 'vitest'
import domains from '../domains.json'
import { parsePort, getEnv } from './utils'
import * as utils from './utils'
import { getStates } from './ika'

const available = Object.values(domains)

const state_empty = [{
    workspace: 'test-1',
    readme: "a",
    specification: "b",
    isValid: false,
    services: []
}]

const state_a = [{
    workspace: 'test-1',
    readme: "a",
    specification: "b",
    isValid: false,
    services: [{
        name: '',
        command: '',
        state: '',
        ports: [{exposed: {
            port: 9001,
            protocol: ""
        }}]
    }]
}]

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

        const s = state_empty[0]

        const ws = vi.spyOn(utils, 'getWorkspaceState');
        ws.mockImplementation(async (workspace: string) => s)

        const state = await getStates()

        assert.deepEqual(state, state_empty)
    })


    test('test get all subdomains in use empty state', async () => {
        const inUse = await utils.getAllSubdomainsInUse(state_empty)

        assert.deepEqual(inUse, [])
    })

    test('test get all subdomains in use one', async () => {
        const inUse = await utils.getAllSubdomainsInUse(state_a)

        assert.deepEqual(inUse, ["yellow-elephant"])
    })

    test('test get all subdomains available all', async ()=>{
        const available = await utils.getAllSubdomainsAvailable(state_empty)

        assert.deepEqual(available, utils.allSubdomainsNames)
    })

    test('test get all subdomains available one', async ()=>{
        const available = await utils.getAllSubdomainsAvailable(state_a)

        assert.deepEqual(available, ["angry-fridge"])
    })
})
