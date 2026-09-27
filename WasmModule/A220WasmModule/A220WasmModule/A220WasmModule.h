// A220WasmModule.h : Include file for standard system include files,
// or project specific include files.

#pragma once

#ifndef __INTELLISENSE__
#	define MODULE_EXPORT __attribute__( ( visibility( "default" ) ) )
#	define MODULE_WASM_MODNAME(mod) __attribute__((import_module(mod)))
#else
#	define MODULE_EXPORT
#	define MODULE_WASM_MODNAME(mod)
#	define __attribute__(x)
#	define __restrict__
#endif

#include <MSFS/MSFS.h>

#include <MSFS/Legacy/gauges.h>
#include <MSFS/MSFS.h>
#include <SimConnect.h>
#include <iostream>
#include <map>
#include <string>

enum DATA_DEFINE_ID {
	DEFINITION_LVARS,
	DEFINITION_SOUND_VAR,
};

enum DATA_REQUEST_ID {
	REQUEST_FETCH_LVARS,
	REQUEST_SOUND_VAR
};

enum eEvents
{
	EVENT_FLIGHT_LOADED,
	EVENT_FRAME
};

struct State {
	HANDLE hSimConnect = NULL;
	bool isActive = false;
	bool actualState = false;
};