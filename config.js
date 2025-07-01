const datasets = {
    "Planes": {
        notice: "© adsb.lol (ODbL v1.0), © airplanes.live, © adsbexchange.com",
        endpoints: [
            {
                name: "Cloud (Real-Time)",
                urls: [
                    {
                        url: "https://kvzqttvc2n.eu-west-1.aws.clickhouse-staging.com",
                        sticky: "https://{hash}.sticky.kvzqttvc2n.eu-west-1.aws.clickhouse-staging.com",
                    }
                ]
            },
            {
                name: "Any",
                urls: [
                    {
                        url: "https://kvzqttvc2n.eu-west-1.aws.clickhouse-staging.com",
                        sticky: "https://{hash}.sticky.kvzqttvc2n.eu-west-1.aws.clickhouse-staging.com",
                    },
                    {
                        url: "https://fly-selfhosted-backend-3.clickhouse.com",
                    }
                ]
            },
            {
                name: "Self-hosted (Snapshot)",
                urls: [
                    {
                        url: "https://fly-selfhosted-backend-3.clickhouse.com",
                    }
                ]
            },
        ],
        levels: [
            { table: 'planes_mercator_sample100', sample: 100, priority: 1 },
            { table: 'planes_mercator_sample10',  sample: 10,  priority: 2 },
            { table: 'planes_mercator',           sample: 1,   priority: 3 },
        ],
        report_total: {
            query: (condition => `
                WITH mercator_x >= {left:UInt32} AND mercator_x < {right:UInt32}
                    AND mercator_y >= {top:UInt32} AND mercator_y < {bottom:UInt32} AS in_tile
                SELECT
                    count() AS traces,
                    uniq(r) AS aircrafts,
                    uniq(t) AS types,
                    uniqIf(aircraft_flight,
                    aircraft_flight != '') AS flights,
                    min(time) AS first, max(time) AS last
                FROM {table:Identifier}
                WHERE ${condition}`),
            content: (json => {
                let row = json.data[0];
                let text = `Total ${Number(row.traces).toLocaleString()} traces, ${Number(row.aircrafts).toLocaleString()} aircrafts of ${Number(row.types).toLocaleString()} types, ${Number(row.aircrafts).toLocaleString()} flight nums.`;

                if (row.traces > 0) {
                    text += ` Time: ${row.first} — ${row.last}.`;
                }

                if (json.statistics.rows_read > 1) {
                    text += ` Processed ${Number(json.statistics.rows_read).toLocaleString()} rows.`;
                }

                return text;
            }),
        },
        reports: [
            {
                query: (condition => `
                    WITH mercator_x >= {left:UInt32} AND mercator_x < {right:UInt32}
                        AND mercator_y >= {top:UInt32} AND mercator_y < {bottom:UInt32} AS in_tile
                    SELECT aircraft_flight, count() AS c
                    FROM {table:Identifier}
                    WHERE aircraft_flight != '' AND NOT startsWith(aircraft_flight, '@@@') AND ${condition}
                    GROUP BY aircraft_flight
                    ORDER BY c DESC
                    LIMIT 100`),
                field: 'aircraft_flight',
                id: 'report_flights',
                title: 'Flights: ',
                separator: ', ',
                content: (row => row.aircraft_flight)
            },
            {
                query: (condition => `
                    WITH mercator_x >= {left:UInt32} AND mercator_x < {right:UInt32}
                        AND mercator_y >= {top:UInt32} AND mercator_y < {bottom:UInt32} AS in_tile
                    SELECT t, anyIf(desc, desc != '') AS desc, count() AS c
                    FROM {table:Identifier}
                    WHERE t != '' AND ${condition}
                    GROUP BY t
                    ORDER BY c DESC
                    LIMIT 100`),
                field: 't',
                wiki_field: 'desc',
                id: 'report_types',
                title: 'Types:\n',
                separator: ',\n',
                content: (row => `${row.t} (${row.desc})`)
            },
            {
                query: (condition => `
                    WITH mercator_x >= {left:UInt32} AND mercator_x < {right:UInt32}
                        AND mercator_y >= {top:UInt32} AND mercator_y < {bottom:UInt32} AS in_tile
                    SELECT r, count() AS c
                    FROM {table:Identifier}
                    WHERE r != '' AND ${condition}
                    GROUP BY r
                    ORDER BY c DESC
                    LIMIT 100`),
                field: 'r',
                id: 'report_regs',
                title: 'Registration: ',
                separator: ', ',
                content: (row => row.r)
            },
            {
                query: (condition => `
                    WITH mercator_x >= {left:UInt32} AND mercator_x < {right:UInt32}
                        AND mercator_y >= {top:UInt32} AND mercator_y < {bottom:UInt32} AS in_tile
                    SELECT ownOp, count() AS c
                    FROM {table:Identifier}
                    WHERE ownOp != '' AND ${condition}
                    GROUP BY ownOp
                    ORDER BY c DESC
                    LIMIT 100`),
                field: 'ownOp',
                id: 'report_owners',
                title: 'Owner:\n',
                separator: ',\n',
                content: (row => row.ownOp)
            },
        ],
        queries: {
"567": `WITH
    bitShiftLeft(1::UInt64, {z:UInt8}) AS zoom_factor,
    bitShiftLeft(1::UInt64, 32 - {z:UInt8}) AS tile_size,

    tile_size * {x:UInt32} AS tile_x_begin,
    tile_size * ({x:UInt32} + 1) AS tile_x_end,

    tile_size * {y:UInt32} AS tile_y_begin,
    tile_size * ({y:UInt32} + 1) AS tile_y_end,

    mercator_x >= tile_x_begin AND mercator_x < tile_x_end
    AND mercator_y >= tile_y_begin AND mercator_y < tile_y_end AS in_tile,

    bitShiftRight(mercator_x - tile_x_begin, 32 - 10 - {z:UInt8}) AS x,
    bitShiftRight(mercator_y - tile_y_begin, 32 - 10 - {z:UInt8}) AS y,

    y * 1024 + x AS pos,

    greatest(0, least(avg(altitude), 50000)) / 50000 AS color1,
    greatest(0, least(avg(ground_speed), 700)) / 700 AS color2,

    255 AS alpha,
    255 AS red,
    color1 * 255 AS green,
    color2 * 255 AS blue

SELECT round(red)::UInt8, round(green)::UInt8, round(blue)::UInt8, round(alpha)::UInt8
FROM {table:Identifier} AS t
WHERE in_tile AND icao in ('ae5f50','ae6829', 'ae6807','ae6800', 'ae689d', 'ae6802', 'ae6863','ae677d','ae6a3d','ae6a3e','ae222d','ae57cc','ae678b','ae67f2','ae6817','ae6899','ae6873','ae57ce','ae57d0','ae67be','ae683a','ae6812','ae67f7')
GROUP BY pos ORDER BY pos WITH FILL FROM 0 TO 1024*1024`,
"MUGU": `WITH
    bitShiftLeft(1::UInt64, {z:UInt8}) AS zoom_factor,
    bitShiftLeft(1::UInt64, 32 - {z:UInt8}) AS tile_size,

    tile_size * {x:UInt32} AS tile_x_begin,
    tile_size * ({x:UInt32} + 1) AS tile_x_end,

    tile_size * {y:UInt32} AS tile_y_begin,
    tile_size * ({y:UInt32} + 1) AS tile_y_end,

    mercator_x >= tile_x_begin AND mercator_x < tile_x_end
    AND mercator_y >= tile_y_begin AND mercator_y < tile_y_end AS in_tile,

    bitShiftRight(mercator_x - tile_x_begin, 32 - 10 - {z:UInt8}) AS x,
    bitShiftRight(mercator_y - tile_y_begin, 32 - 10 - {z:UInt8}) AS y,

    y * 1024 + x AS pos,

    greatest(0, least(avg(altitude), 50000)) / 50000 AS color1,
    greatest(0, least(avg(ground_speed), 700)) / 700 AS color2,

    255 AS alpha,
    255 AS red,
    color1 * 255 AS green,
    color2 * 255 AS blue

SELECT round(red)::UInt8, round(green)::UInt8, round(blue)::UInt8, round(alpha)::UInt8
FROM {table:Identifier} AS t
WHERE in_tile AND icao in ('ae6a3d','ae6a3e','ae222d','ae57cc','ae678b','ae67f2','ae6817','ae6899','ae6873','ae57ce','ae57d0','ae67be','ae683a','ae6812','ae67f7'
)
GROUP BY pos ORDER BY pos WITH FILL FROM 0 TO 1024*1024`

        }
    }
};
