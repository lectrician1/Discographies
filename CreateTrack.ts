import { addItemStatement, copyItem, SiteEntities } from './DiscographiesClasses'

export async function showCreateTrack(thisEntityID: string, siteEntities: SiteEntities) {

    let createTrackID = 'createTrack'

    let trackTypeIDs: {[label: string]: string} = {
        'music track with vocals': siteEntities.items.music_track_with_vocals.id,
        'music track without vocals': siteEntities.items.music_track_without_vocals.id,
        'audio track': siteEntities.items.audio_track.id
    }

    addTrackTypeSelector(createTrackID, trackTypeIDs)

    handleTrackSubmit(createTrackID, siteEntities, thisEntityID)
}

function addTrackTypeSelector(createTrackID: string, trackTypeIDs: { [label: string]: string }) {
    $('.wikibase-sitelinkgrouplistview').append(`<form id="${createTrackID}">
    <label for="type">Create a track:</label>
    <select id="trackType" name="type">
    </select>
    <input type="submit">
  </form>`)

    $.each(trackTypeIDs, function (label, id) {
        $(`#trackType`).append(`<option value="${id}">${label}</option>`)
    })
}

function handleTrackSubmit(createTrackID: string, siteEntities: SiteEntities, thisEntityID: string) {
    $(`#${createTrackID}`).on('submit', async function (event) {
        event.preventDefault()
        let trackType = String($(`#trackType`).val())

        let propertiesToKeep = [
            siteEntities.properties.title.id,
            siteEntities.properties.performer.id,
            siteEntities.properties.publication_date.id
        ]

        let claimsToAdd = {
            ...addItemStatement(siteEntities.properties.instance_of.id, trackType),
            ...addItemStatement(siteEntities.properties.recording_performance_of.id, thisEntityID)
        }

        await copyItem(thisEntityID, propertiesToKeep, claimsToAdd)
    })
}
