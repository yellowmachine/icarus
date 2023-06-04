import type { DockerComposePsResult } from "docker-compose";

export type WORKSPACE = {
    workspace: string,
    readme: string,
    specification: string,
    isValid: boolean,
    services: DockerComposePsResult["services"]
}

type EXPOSED_SERVICE = {
    name: string,
    ports: {
        mapped?: {
            port: number
        },
        exposed: {
            port: string
        }
    }[]
}

export type WORKSPACE_EXPOSED = {
    workspace: string,
    readme: string,
    specification: string,
    isValid: boolean,
    services: EXPOSED_SERVICE[]
}