import { rm, mkdir } from 'fs/promises';
import { uuid } from 'uuidv4';
import { parse } from 'yaml'
import { Mutex } from 'async-mutex';
import { 
    readReadme, readSpecification,
    _cmd, cmd, getWorkspaceState, rootPath,
    writeReadme, writeSpecification, getAllSubdomainsAvailable,
    getEnv, isWorkspace, getWorkspaceNames, getSubdomain
} from './utils';
import type { WORKSPACE_EXPOSED } from './types';

console.log(rootPath)

const mutex = new Mutex();

export async function getStates(){    
    const dirs = await getWorkspaceNames(rootPath)

    const states = await Promise.all(
        dirs.map(async (name) => {
            return await getWorkspaceState(name)
        })
    )
    return states
}

export async function getExposedStates(){
    const s = await getStates()
    const ret = s.map(w => ({...w, services: w.services.map(x => ({...x, ports: x.ports.map(y => ({...y, exposed: {port: getSubdomain(y.exposed.port)}}))}))}))
    return ret as WORKSPACE_EXPOSED[]
}

/// WORKSPACE

export async function _up(workspace: string, specification: string){
    const j = parse(specification) as {services: {ports: string[]}[]}
    const state = await getStates()
    const available = await getAllSubdomainsAvailable(state)
    const _env = Object.values(j.services).map( x => getEnv(x.ports, available))
    const env = Object.assign({}, ..._env)
    return await cmd('up', workspace, [], env)  
}

export async function upWorkspace(workspace: string){
    const p = `${rootPath}/${workspace}`
    const specification = await readSpecification(p)
    return await mutex.runExclusive(() => _up(p, specification))
}

export async function cloneAndUpWorkspace(workspace: string){
    const p = `${rootPath}/${workspace}`
    const readme = await readReadme(p)
    const specification = await readSpecification(p)
    const tmp = uuid()
    const cloned = `${rootPath}/${workspace}_tmp_${tmp}`
    await createWorkspace(cloned, readme, specification)
    return await cmd('up', cloned)
}

export async function downWorkspace(workspace: string, options?: string[]){
    const ret = await cmd('down', `${rootPath}/${workspace}`, options)
    return ret
}

async function isRunning(name: string){
    const ps = await getWorkspaceState(name)
    return ps.services.length > 0
}

async function createWorkspace(name: string, readme: string, specification: string){
    await mkdir(name)
    await writeReadme(name, readme)
    await writeSpecification(name, specification)
    return {done: true}
}

export async function saveWorkspace(name: string, readme: string, specification: string){
    const p = `${rootPath}/${name}`
    const isDir = await isWorkspace(p)
    if(!isDir){
        return await createWorkspace(p, readme, specification)
    }else{
        if(await isRunning(name)) throw "Workspace is running"
        await writeReadme(p, readme)
        await writeSpecification(p, specification)
        return {done: true} 
    }
}

export async function deleteWorkspace(name: string){
    const p = `${rootPath}/${name}`
    if(!isWorkspace(p)) throw "Workspace doesn't exist"
    await downWorkspace(name, ["-v"])
    await rm(p, { recursive: true, force: true });
    return {done: true}
}

/// END WORKSPACE
