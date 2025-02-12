// authentication.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { User } from './auth.models';
import * as AuthActions from './authentication.actions';

export interface AuthenticationState {
    isLoggedIn: boolean;
    user: User | null;
    error: string | null;
}

const initialState: AuthenticationState = {
    isLoggedIn: false,
    user: null,
    error: null,
};
export const authenticationReducer = createReducer(
    initialState,

    on(AuthActions.login, (state) => ({ ...state, error: null })),
    on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, isLoggedIn: true, user, error: null, })),
    // on(AuthActions.loginFailure, (state, { error }) => ({ ...state, error })),
    on(AuthActions.loginFailure, (state, { error }) => {
      return { ...state, error };
    }),
    on(AuthActions.logout, (state) => ({ ...state, user: null })),

);
    // on(Register, (state) => ({ ...state, error: null })),
    // on(RegisterSuccess, (state, { user }) => ({ ...state, isLoggedIn: true, user, error: null, })),
    // on(RegisterFailure, (state, { error }) => ({ ...state, error })),
