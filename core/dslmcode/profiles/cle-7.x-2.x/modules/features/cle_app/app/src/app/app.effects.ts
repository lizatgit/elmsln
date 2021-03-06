import 'rxjs/add/operator/mergeMap';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store'
import { Effect, Actions } from '@ngrx/effects';
import {
  ActionTypes,
  loadAssignmentsSuccess,
  createAssignment,
  createAssignmentSuccess,
  updateAssignmentSuccess,
  deleteAssignment,
  loadPermissions,
  loadPermissionsSuccess,
} from './app.actions';
import { AssignmentService } from './assignment.service';
import { ElmslnService } from './elmsln.service';
declare const Materialize:any;

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private assignmentService:AssignmentService,
    private elmslnService: ElmslnService
  ) { }

  @Effect() createAssignment$ = this.actions$
    .ofType(ActionTypes.CREATE_ASSIGNMENT)
    .mergeMap(action => this.assignmentService.createAssignment(action.payload))
    .map(assignmentId => createAssignmentSuccess(assignmentId));

  // Update the assignment on the server
  @Effect() updateAssignment$ = this.actions$
    .ofType(ActionTypes.UPDATE_ASSIGNMENT)
    .mergeMap(action => {
      return this.assignmentService.updateAssignment(action.payload)
        .mergeMap((data) => this.assignmentService.getAssignment(action.payload.id));
    })
    .map((assignment) => updateAssignmentSuccess(assignment));

  @Effect() loadAssignments$ = this.actions$
    .ofType(ActionTypes.LOAD_ASSIGNMENTS)
    .mergeMap(() => this.assignmentService.loadAssignments())
    // Dispatch action to load assignment success
    .map(assignments => loadAssignmentsSuccess(assignments))
  
  // Populate the user.permissions store when the user profile returns
  @Effect() loadPermissions$ = this.actions$
    .ofType(ActionTypes.LOAD_PERMISSIONS)
    .mergeMap(() => this.elmslnService.getUserProfile())
    .map(profile => {
      if (typeof profile.user.permissions !== 'undefined') {
        return loadPermissionsSuccess(profile.user.permissions, profile.user['csrf-token'], Number(profile.user['uid']));
      }
      else {
        return loadPermissionsSuccess([], null, null);
      }
    })

  @Effect({dispatch: false}) deleteAssignment$ = this.actions$
    .ofType(ActionTypes.DELETE_ASSIGNMENT)
    .mergeMap(action => this.assignmentService.deleteAssignment(action.payload))
    .map(info => {
      Materialize.toast('Assignment deleted', 1000);
    })
}
