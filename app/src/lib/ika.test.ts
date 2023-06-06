import { assert, test, vi, describe, afterEach, expect } from 'vitest'
import { parsePort, getEnv } from './utils'
import * as utils from './utils'
import { getStates, _up } from './ika'

const all = utils.allSubdomainsNames

const specification = `
services:
    app:
        ports:
            - $A:8080
`

const state_empty = [{
    workspace: 'test-1',
    readme: "a",
    specification,
    isValid: false,
    services: []
}]

const state_a = [{
    ...state_empty[0],
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


const state_b = [{
    ...state_empty[0],
    services: [{
        name: '',
        command: '',
        state: '',
        ports: [{exposed: {
            port: 9000,
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
        assert.deepEqual(getEnv([""], all), {})
    })
    
    test('get env empty two empty items', () => {
        assert.deepEqual(getEnv(["", ""], all), {})
    })
    
    test('get env one item', () => {
        assert.deepEqual(getEnv(["$A:8080"], all), {A: "9000"})
    })
    
    test('get env two items', () => {
        assert.deepEqual(getEnv(["$A:8080", "$B:3000"], all), {A: "9000", B: "9001"})
    })

    test('get states', async () => {
        const dirs = vi.spyOn(utils, 'getWorkspaceNames');
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

    test("cmd is called with up command", async () => {
        const m = vi.spyOn(utils, "cmd")
        m.mockImplementation(async () => ({
            exitCode: 0,
            data: {}
        }))

        const dirs = vi.spyOn(utils, 'getWorkspaceNames');
        dirs.mockImplementation(async ()=>['test-1'])

        const ws = vi.spyOn(utils, 'getWorkspaceState');
        ws.mockImplementation(async (workspace: string) => state_empty[0])

        await _up("../test-1", specification)

        expect(m).toBeCalledWith("up", "../test-1", [], {A: "9000"})
    })

    test("cmd is called with up command and state b (9000)", async () => {
        const m = vi.spyOn(utils, "cmd")
        m.mockImplementation(async () => ({
            exitCode: 0,
            data: {}
        }))

        const dirs = vi.spyOn(utils, 'getWorkspaceNames');
        dirs.mockImplementation(async ()=>['test-1'])

        const ws = vi.spyOn(utils, 'getWorkspaceState');
        ws.mockImplementation(async (workspace: string) => state_b[0])

        await _up("../test-1", specification)

        expect(m).toBeCalledWith("up", "../test-1", [], {A: "9001"})
    })
})
