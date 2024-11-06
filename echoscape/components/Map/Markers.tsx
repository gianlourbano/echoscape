import { POIDetailsObjToURL } from "@/app/(home)/poi/[poi]";
import SuperclusterClass from "@/utils/markers/supercluster";
import SuperclusterNS from "@/utils/markers/types";
import { Href, Link } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Callout, Marker } from "react-native-maps";
import { Badge, Icon, IconButton } from "react-native-paper";

interface MarkerProps {
    point:
        | SuperclusterNS.PointFeature<SuperclusterNS.AnyProps>
        | SuperclusterNS.ClusterFeature<SuperclusterNS.AnyProps>;
}

type ClusterMarkerProps = MarkerProps & {
    supercluster: SuperclusterClass<
        SuperclusterNS.AnyProps,
        SuperclusterNS.AnyProps
    >;
};

export function ClusterMarker({ point, supercluster }: ClusterMarkerProps) {
    return (
        <>
            <View className="p-2">
                <Badge style={styles.badge}>
                    {point.properties.point_count <= 10
                        ? point.properties.point_count
                        : "10+"}
                </Badge>
                <Icon source="playlist-music" size={30} />
            </View>
            <Callout>
                <View className="w-56 flex flex-col gap-2 items-center justify-center">
                    {supercluster
                        ?.getLeaves(point.properties.cluster_id, 10)
                        .map((leaf) => {
                            switch (leaf.properties.type) {
                                case "audio":
                                    return <AudioMarkerCallout point={leaf} key={leaf.properties.id} />;
                                case "poi":
                                    return <POIMarkerCallout point={leaf} key={leaf.properties.id}/>;
                                case "special":
                                    return (
                                        <SpecialMarkerCallout point={leaf} key={leaf.properties.id}/>
                                    );
                                default:
                                    return <POIMarkerCallout point={leaf} key={leaf.properties.id}/>;
                            }
                        })}
                </View>
            </Callout>
        </>
    );
}

function AudioMarkerCallout({ point }: MarkerProps) {
    return (
        <Link href={`/song/${point.properties.id.split("-")[1]}`} className="w-56" key={point.properties.id}>
            <View className="w-56 flex flex-row gap-2 items-center justify-center">
                <Icon source={"music"} size={30} color="black" />
                <Text
                    className=" text-center max-w-40"
                >
                    {point.properties.name}
                </Text>
            </View>
        </Link>
    );
}

export function AudioMarker({ point }: MarkerProps) {
    return (
        <>
            <IconButton icon={"music"} size={30} />
            <Callout>
                <AudioMarkerCallout point={point} />
            </Callout>
        </>
    );
}

function POIMarkerCallout({ point }: MarkerProps) {
    return (
        <View className="w-56 flex flex-row gap-2 items-center justify-center" key={point.properties.id}>
            <Icon source={"bookshelf"} size={30} color="black" />
            <Link 
                href={POIDetailsObjToURL({
                    poi: point.properties.id,
                    name: point.properties.name,
                    wikidata: point.properties.wikidata,
                    wikipedia: point.properties.wikipedia,
                    latitude: point.geometry.coordinates[1].toString(),
                    longitude: point.geometry.coordinates[0].toString(),
                }) as unknown as Href<string>}
                key={point.properties.id} 
                className=" text-center max-w-40"
            >
                {point.properties.name}
            </Link>
        </View>
    );
}

export function POIMarker({ point }: MarkerProps) {
    return (
        <>
            <IconButton icon={"pokemon-go"} size={30} />
            <Callout>
                <POIMarkerCallout point={point} />
            </Callout>
        </>
    );
}

function SpecialMarkerCallout({ point }: MarkerProps) {
    return (
        <View className="w-56 flex flex-row gap-2 items-center justify-center" key={point.properties.id}>
            <Icon source={point.properties.icon} size={30} color="black" />
            <Text key={point.properties.id} className=" text-center max-w-40">
                {point.properties.name}
            </Text>
        </View>
    );
}

export function SpecialMarker({ point }: MarkerProps) {
    return (
        <>
            <IconButton icon={point.properties.icon} size={30} />
            <Callout>
                <SpecialMarkerCallout point={point} />
            </Callout>
        </>
    );
}

export function render({ point }: MarkerProps) {
    switch (point.properties.type) {
        case "audio":
            return <AudioMarker point={point} />;
        case "poi":
            return <POIMarker point={point} />;
        case "special":
            return <SpecialMarker point={point} />;
        default:
            return <POIMarker point={point} />;
    }
}

const styles = StyleSheet.create({
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 1000,
    },
});
