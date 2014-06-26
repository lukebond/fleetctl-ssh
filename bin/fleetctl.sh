#!/bin/bash
# modified from https://github.com/deis/deis/blob/master/controller/scheduler/fleetctl.
set -e

SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"
[[ $FLEETW_KEY ]] && SSH_OPTIONS="-i $FLEETW_KEY $SSH_OPTIONS"
[[ $FLEETW_PORT ]] && SSH_OPTIONS="-p $FLEETW_PORT $SSH_OPTIONS"

# set debug if provided as an envvar
[[ $DEBUG ]] && set -x

# if fleet unit is defined, scp it to the remote host
if [[ $FLEETW_UNIT ]]; then
  if [[ $FLEETW_UNIT_DATA ]]; then
    unitfile=$(mktemp /tmp/fleetrc.XXXX)
    echo $FLEETW_UNIT_DATA | base64 -d > $unitfile
  else
    unitfile=$FLEETW_UNIT_FILE
  fi
  scp `echo $SSH_OPTIONS | tr -- "-p " "-P "` $unitfile core@$FLEETW_HOST:$FLEETW_UNIT
fi

# run the fleetctl command remotely
ssh $SSH_OPTIONS core@$FLEETW_HOST fleetctl $@
