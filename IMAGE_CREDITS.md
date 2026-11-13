# Artwork and image provenance

## Current frontend status

The active OMNIVEX frontend no longer uses the prototype cosplay photographs as character imagery. The homepage has been replaced with a data-driven page, and entity cards/dossiers use neutral placeholders until an actual image is attached to the exact entity version and reviewed.

Older photo references from the first visual prototype are preserved below as attribution history only. They are retired and must not be reintroduced as character artwork. A photograph of a person dressed as a character is not a substitute for the character itself.

## Approved media policy

Character and universe media belongs to a specific entity-version record. The frontend may display a primary image only when all of the following are true:

- The image is attached to the exact entity_versions record represented on screen.
- The asset URL and source URL are present.
- The usage basis is explicitly recorded as public domain, CC0, CC BY, CC BY-SA, licensed, publisher-authorized or user-owned.
- The media record has approval_status = approved.
- Attribution and license requirements are retained with the media record.

The database table and incremental migration are:
- public.entity_media in supabase/schema.sql
- supabase/migrations/20261113_entity_media_provenance.sql

An unreviewed, disputed, rejected or unlicensed asset is not rendered. If no approved version-matched media exists, the UI shows a neutral atlas placeholder instead.

## Retired prototype photo references

The following attributions are retained to document imagery used during earlier prototype work. These images are no longer used by the active frontend.

| Subject shown in prototype | File / author | License | Source |
|---|---|---|---|
| Spider-Man cosplay | Spider-Man cosplay.jpg — ManoSolo13241324 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Spider-Man_cosplay.jpg |
| Iron Man image | Iron Man transparent background.png — David Blaikie | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Iron_Man_transparent_background.png |
| Thanos cosplay | THANOS-Cosplay.jpg — Gab99999 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:THANOS-Cosplay.jpg |
| Batman cosplay | PA comic convention Cosplay of Batman.jpg — LostplanetKD73 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:PA_comic_convention_Cosplay_of_Batman.jpg |
| Superman cosplay | Cosplayers as Superman and K'Zuri the Unbound at L.A. Comic Con 2026 (Vertical).jpg — Carlos Guzman | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Cosplayers_as_Superman_and_K%27Zuri_the_Unbound_at_L.A._Comic_Con_2026_(Vertical).jpg |
| Thor cosplay | Thor Cosplay.jpg — Juan Ignacio Rodríguez de León | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Thor_Cosplay.jpg |
| Doctor Strange cosplay | 2023 NYCC Cosplay of Doctor Strange.jpg — LostplanetKD73 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:2023_NYCC_Cosplay_of_Doctor_Strange.jpg |
| Marvel cosplay group | Cosplay of Female Loki, Hawkeye and Captain America at the 2011 New York Comic Con.jpg — JoeInQueens | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Cosplay_of_Female_Loki,_Hawkeye_and_Captain_America_at_the_2011_New_York_Comic_Con.jpg |
| Goku cosplay | Cosplay of Goku from Dragon Ball at Made in Asia 2023.jpg — Miguel Discart | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Cosplay_of_Goku_from_Dragon_Ball_at_Made_in_Asia_2023.jpg |
| Naruto cosplay group | Group Portrait of Naruto Cosplayers at CWT40 20150809.jpg — 玄史生 | CC0 1.0 | https://commons.wikimedia.org/wiki/File:Group_Portrait_of_Naruto_Cosplayers_at_CWT40_20150809.jpg |
| Kratos cosplay | Kratos Cosplayer at Lucca Comics & Games 2014.jpg — Claudio Marinangeli | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Kratos_Cosplayer_at_Lucca_Comics_%26_Games_2014.jpg |
| Poseidon statue | Statue of Poseidon with Parian marble.jpg — Pinterpandai.com | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Statue_of_Poseidon_with_Parian_marble.jpg |

Check each original file page for the precise license terms before considering any reuse. Retaining an attribution record does not mean an asset is still displayed or approved for OMNIVEX.
