// A220WasmModule.cpp

#include <stdio.h>
#include "A220WasmModule.h"
#include <iostream>

State state;

void CALLBACK MyDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData,
	void* pContext) {
	HRESULT hr;
	State* appState = reinterpret_cast<State*>(pContext);

	switch (pData->dwID) {
	case SIMCONNECT_RECV_ID_SIMOBJECT_DATA: {
		SIMCONNECT_RECV_SIMOBJECT_DATA* pObjData =
			(SIMCONNECT_RECV_SIMOBJECT_DATA*)pData;
		if (pObjData->dwRequestID == REQUEST_FETCH_LVARS) {
			double* ptr = reinterpret_cast<double*>(&pObjData->dwData);
			bool state = ptr[0] == 1;
			if (state || state != appState->isActive) {
				appState->isActive = state;
				double att_pitch = 0;

				if (state)
					execute_calculator_code("1 (>L:A22X Aural Caution)", &att_pitch, NULL, NULL);
				else
					execute_calculator_code("0 (>L:A22X Aural Caution)", &att_pitch, NULL, NULL);
			}
		}	
		
		break;
	}
	}

	//SimConnect_CallDispatch(state.hSimConneect, MyDispatchProc, &state);
	/*
		if (bat == 1) {

		double att_pitch = 0;
		if (getVar("CIRCUIT ON:49") == 1)
			execute_calculator_code("49 (>K:ELECTRICAL_CIRCUIT_TOGGLE)", &att_pitch, NULL, NULL);
	}
	*/


}

extern "C" MSFS_CALLBACK void module_init(void)
{
	if (SUCCEEDED(
		SimConnect_Open(&state.hSimConnect, "A220AcarsModule", NULL, 0, 0, 0))) {

		SimConnect_AddToDataDefinition(state.hSimConnect, DEFINITION_LVARS,
			"L:LIZ3_A22X_ACS_NOTIF", "number", SIMCONNECT_DATATYPE_FLOAT64);
		SimConnect_AddToDataDefinition(state.hSimConnect, DEFINITION_SOUND_VAR,
			"L:A22X Aural Caution", "number", SIMCONNECT_DATATYPE_FLOAT64);


		SimConnect_RequestDataOnSimObject(
			state.hSimConnect, REQUEST_FETCH_LVARS, DEFINITION_LVARS, SIMCONNECT_OBJECT_ID_USER,
			SIMCONNECT_PERIOD_SIM_FRAME);

		SimConnect_SubscribeToSystemEvent(state.hSimConnect, EVENT_FRAME, "Frame");


		SimConnect_CallDispatch(state.hSimConnect, MyDispatchProc, &state);

	}
}


extern "C" MSFS_CALLBACK void module_deinit(void)
{

	SimConnect_Close(state.hSimConnect);
	state.hSimConnect = NULL;

}
