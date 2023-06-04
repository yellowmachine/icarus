import { assert, expect, test } from 'vitest'
import { parsePort, getEnv } from './ika'

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
    assert.deepEqual(getEnv([""]), {})
})

test('get env empty two empty items', () => {
    assert.deepEqual(getEnv(["", ""]), {})
})

test('get env one item', () => {
    assert.deepEqual(getEnv(["$A:8080"]), {A: "9000"})
})

test('get env two items', () => {
    assert.deepEqual(getEnv(["$A:8080", "$B:3000"]), {A: "9001", B: undefined})
})