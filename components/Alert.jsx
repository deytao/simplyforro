import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

import { alertService, AlertType } from 'lib/alert.js';

export { Alert };

Alert.propTypes = {
    id: PropTypes.string,
    fade: PropTypes.bool
};

Alert.defaultProps = {
    id: 'default-alert',
    fade: true
};

function Alert({ id, fade }) {
    const mounted = useRef(false);
    const router = useRouter();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        mounted.current = true;

        // subscribe to new alert notifications
        const subscription = alertService.onAlert(id)
            .subscribe(alert => {
                // clear alerts when an empty alert is received
                if (!alert.message) {
                    setAlerts(alerts => {
                        // filter out alerts without 'keepAfterRouteChange' flag
                        const filteredAlerts = alerts.filter(x => x.keepAfterRouteChange);

                        // remove 'keepAfterRouteChange' flag on the rest
                        return omit(filteredAlerts, 'keepAfterRouteChange');
                    });
                } else {
                    // add alert to array with unique id
                    alert.itemId = Math.random();
                    setAlerts(alerts => ([...alerts, alert]));

                    // auto close alert if required
                    if (alert.autoClose) {
                        setTimeout(() => removeAlert(alert), 6000);
                    }
                }
            });


        // clear alerts on location change
        const clearAlerts = () => alertService.clear(id);
        router.events.on('routeChangeStart', clearAlerts);

        // clean up function that runs when the component unmounts
        return () => {
            mounted.current = false;

            // unsubscribe to avoid memory leaks
            subscription.unsubscribe();
            router.events.off('routeChangeStart', clearAlerts);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function omit(arr, key) {
        return arr.map(obj => {
            const { [key]: omitted, ...rest } = obj;
            return rest;
        });
    }

    function removeAlert(alert) {
        if (!mounted.current) return;

        if (fade) {
            // fade out alert
            setAlerts(alerts => alerts.map(x => x.itemId === alert.itemId ? { ...x, fade: true } : x));

            // remove alert after faded out
            setTimeout(() => {
                setAlerts(alerts => alerts.filter(x => x.itemId !== alert.itemId));
            }, 250);
        } else {
            // remove alert
            setAlerts(alerts => alerts.filter(x => x.itemId !== alert.itemId));
        }
    };

    function cssClasses(alert) {
        if (!alert) return;

        const classes = ['border-l-4', 'p-4'];

        const alertTypeClass = {
            [AlertType.Success]: 'bg-green-100 border-green-500 text-green-700',
            [AlertType.Error]: 'bg-red-100 border-red-500 text-red-700',
            [AlertType.Info]: 'bg-teal-100 border-teal-500 text-teal-700',
            [AlertType.Warning]: 'bg-orange-100 border-orange-500 text-orange-700'
        }

        classes.push(alertTypeClass[alert.type]);

        if (alert.fade) {
            classes.push('fade');
        }

        return classes.join(' ');
    }

    if (!alerts.length) return null;

    return (
        <div>
            {alerts.map((alert, index) =>
                <div key={index} className={`${cssClasses(alert)}`} role="alert">
                    <p dangerouslySetInnerHTML={{ __html: alert.message }}></p>
                </div>
            )}
        </div>
    );
}
