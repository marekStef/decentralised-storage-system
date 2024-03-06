import React, { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/router';
import persistenceManager from '@/data/PersistenceManager';

interface WithSetupValidationOptions {
  redirectToIfNotSetup?: string;
  redirectToIfSetup?: string;
}

function withSetupValidation<P extends React.JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
  { redirectToIfNotSetup = '/Setup', redirectToIfSetup = '/WeekPage' }: WithSetupValidationOptions = {}
) {
  return (props: P) => {
    const Router = useRouter();
    
    const isCalendarSetupSuccessfully = (): boolean => {
      persistenceManager.loadDataFromLocalStorage();
      return persistenceManager.areAllValuesSet();
    };

    useEffect(() => {
      if (typeof window === 'undefined') // if the page is being loaded on the server, and if so, do nothing
          return;

      const setupComplete = isCalendarSetupSuccessfully();

      if (!setupComplete) {
        Router.replace(redirectToIfNotSetup);
        return;
      }

      if (setupComplete) {
        console.log("here")
        Router.replace(redirectToIfSetup);
        return;
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withSetupValidation;
