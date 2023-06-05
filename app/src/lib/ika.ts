import { writeFile, access, rm, mkdir } from 'fs/promises';
import { uuid } from 'uuidv4';
import { parse } from 'yaml'
import { Mutex } from 'async-mutex';
import { 
    readReadme, readSpecification,
    _cmd, cmd, getWorkspaceState, rootPath,
    writeReadme, writeSpecification, getAllSubdomainsAvailable,
    getEnv, isWorkspace
} from './utils';

console.log(rootPath)

/// WORKSPACE

const mutex = new Mutex();

export async function upWorkspace(workspace: string){
    return await mutex.runExclusive(async () => _upWorkspace(workspace))
}

export async function _upWorkspace(workspace: string){
    const p = `${rootPath}/${workspace}`
    const specification = await readSpecification(p)
    const j = parse(specification) as {services: {ports: string[]}[]}
    const available = await getAllSubdomainsAvailable()
    const _env = Object.values(j.services).map( x => getEnv(x.ports, available))
    const env = Object.assign({}, ..._env)
    const ret = await cmd('up', p, [], env)
    return ret
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
